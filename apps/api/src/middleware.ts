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

  const res = NextResponse.next()
  applyCors(res.headers, origin)
  return res
}

export const config = {
  matcher: '/api/:path*',
}
