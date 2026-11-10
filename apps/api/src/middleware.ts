import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// CORS for the headless API. The web app is served from a different subdomain
// (app.<domain>) and calls this API with credentials, so responses must echo an
// explicit allowed origin (never "*" when credentials are included) and answer
// preflight OPTIONS requests.
const allowedOrigins = (
  process.env.CORS_ALLOWED_ORIGINS ||
  process.env.WEB_ORIGIN ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3001'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

function applyCors(headers: Headers, origin: string | null): Headers {
  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.append('Vary', 'Origin')
    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    headers.set('Access-Control-Max-Age', '86400')
  }
  return headers
}

// ── Phase 0 lock-down: edge blocklists (defence in depth; the routes are also removed / guarded) ────────────
// The API host is public, and the web app's middleware does not sit in front of it.
const NEVER_IN_PRODUCTION = ['/api/debug', '/api/dev', '/api/test', '/api/ragas', '/api/experiments', '/api/ground-truth', '/api/scan-books']
// Services that still run on in-memory mock data. They stay dark until they are built on real tables
// (set ENABLE_UNFINISHED_FEATURES=true to switch them on in a non-production environment).
const UNFINISHED = ['/api/mitram', '/api/curricutimer', '/api/quiz']
const startsWithAny = (path: string, prefixes: string[]) => prefixes.some((p) => path === p || path.startsWith(p + '/') || path.startsWith(p + '-'))

// ── Burst limit on the endpoints that cost money or CPU ─────────────────────────────────────────────────────
// The tutor has a daily question quota, but nothing stopped a signed-in account (or a stolen session) from
// hammering the model, OCR, speech and translation endpoints in a tight loop. This caps each session at
// AI_BURST_LIMIT write requests per minute across them. A person asking questions sends 2-3 of these per
// question, so the cap is far above real use.
// In memory, per process: right for the single API container this runs as. Behind more than one instance it
// would need Redis.
const AI_BURST_LIMIT = Number(process.env.AI_BURST_LIMIT_PER_MINUTE) || 30
const AI_BURST_WINDOW_MS = 60_000
const COSTLY = ['/api/ai', '/api/chat', '/api/ai-writing', '/api/file-processing', '/api/ocr', '/api/speech-to-text', '/api/smart-detect', '/api/dictionary/translate']
// Cheap bookkeeping under /api/ai that the tutor calls often; not limited.
const COSTLY_EXEMPT = ['/api/ai/chat/history', '/api/ai/chat/usage', '/api/ai/health']
const burst = new Map<string, { count: number; resetAt: number }>()

function sessionKey(req: NextRequest): string | null {
  // better-auth's cookie is "better-auth.session_token", prefixed "__Secure-" over https.
  const cookie = req.cookies.getAll().find((c) => c.name.endsWith('session_token'))
  return cookie?.value ? cookie.value.slice(0, 48) : null
}

/** Seconds to wait if this request is over the burst limit, otherwise null. Never throws. */
function overBurstLimit(req: NextRequest, path: string): number | null {
  try {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return null
    if (!startsWithAny(path, COSTLY) || startsWithAny(path, COSTLY_EXEMPT)) return null
    // No session cookie: the route answers 401 without doing any work, so there is nothing to protect.
    const key = sessionKey(req)
    if (!key) return null

    const now = Date.now()
    if (burst.size > 5000) {
      for (const [k, v] of burst) if (v.resetAt <= now) burst.delete(k)
    }
    const entry = burst.get(key)
    if (!entry || entry.resetAt <= now) {
      burst.set(key, { count: 1, resetAt: now + AI_BURST_WINDOW_MS })
      return null
    }
    entry.count += 1
    return entry.count > AI_BURST_LIMIT ? Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) : null
  } catch {
    return null // fail open: a limiter bug must not take the tutor down
  }
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin')
  const path = req.nextUrl.pathname

  if (process.env.NODE_ENV === 'production') {
    const hidden =
      startsWithAny(path, NEVER_IN_PRODUCTION) ||
      (process.env.ENABLE_UNFINISHED_FEATURES !== 'true' && startsWithAny(path, UNFINISHED))
    if (hidden) {
      // 404, not 403: don't confirm the route exists.
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: applyCors(new Headers(), origin) })
    }
  }

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: applyCors(new Headers(), origin) })
  }

  const retryAfter = overBurstLimit(req, path)
  if (retryAfter !== null) {
    const headers = applyCors(new Headers(), origin)
    headers.set('Retry-After', String(retryAfter))
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait a moment and try again.', code: 'RATE_LIMIT_EXCEEDED', retryAfter },
      { status: 429, headers },
    )
  }

  const res = NextResponse.next()
  applyCors(res.headers, origin)
  return res
}

export const config = {
  matcher: '/api/:path*',
}
