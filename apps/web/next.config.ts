import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import path from 'path'

// Bundle analyzer setup
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})


// ── Content-Security-Policy ─────────────────────────────────────────────────────────────────────────────────
// script-src is an allowlist of where scripts may LOAD from:
//   'self'                         the app's own bundles
//   cdn.jsdelivr.net               MathJax (components/providers/MathJaxScripts.tsx) and the parts it lazy-loads
//   www.youtube.com                the YouTube iframe API (components/student/YouTubeEmbed.tsx)
//   checkout.razorpay.com          Razorpay checkout (hooks/useRazorpay.ts)
//                                  (payments are not built yet: test checkout under this policy when they are)
// Adding a third-party script anywhere in the app means adding its host here, or the browser blocks it.
//
// What this does and does not buy:
//   + a script tag pointing at any other host is refused, so injected markup cannot pull in an attacker's file
//   + script-src-attr 'none' refuses inline event handlers (onerror=, onclick=), the usual way injected HTML runs
//   - 'unsafe-inline' is still needed: Next's own bootstrap scripts are inline and the pages are statically
//     rendered, so they cannot carry a per-request nonce. An injected inline <script> element is therefore not
//     stopped by this policy. Closing that needs nonces + 'strict-dynamic', which makes every page dynamic.
// 'unsafe-eval' is granted only to `next dev` (React refresh needs it). 'wasm-unsafe-eval' lets WebAssembly
// compile without allowing eval of strings.
const SCRIPT_SRC = [
  "'self'",
  "'unsafe-inline'",
  "'wasm-unsafe-eval'",
  ...(process.env.NODE_ENV === 'production' ? [] : ["'unsafe-eval'"]),
  'https://cdn.jsdelivr.net',
  'https://www.youtube.com',
  'https://checkout.razorpay.com',
].join(' ')

const CONTENT_SECURITY_POLICY = [
  `script-src ${SCRIPT_SRC}`,
  "script-src-attr 'none'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ')

const nextConfig: NextConfig = {
  // Phase 0: don't advertise the framework.
  // NOTE: this is read when the server STARTS, not when it is built. The Docker image used to ship without
  // any Next config, so `next start` fell back to the default and sent "X-Powered-By: Next.js" on every page.
  // The image now carries next.config.runtime.js as its next.config.js; keep the two in step.
  poweredByHeader: false,
  // NOTE: `output: 'standalone'` is intentionally NOT used here. In this
  // npm-workspace monorepo, standalone tracing can't see the hoisted root
  // node_modules from apps/web, and the fix (outputFileTracingRoot) conflicts
  // with this app's custom webpack config. The Docker image instead ships a
  // pruned node_modules and runs `next start` (see apps/web/Dockerfile).
  // Compile the shared workspace packages (TS source) directly.
  transpilePackages: ['@repo/shared', '@repo/core'],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: [
    "app.vinstitution.com",
    "desktop-9mdcf0m.taile7a3e3.ts.net"
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "vinstitution.com",
        "*.vinstitution.com",
        "desktop-9mdcf0m.taile7a3e3.ts.net",
        "recollect-resonate-clone.ngrok-free.dev"
      ]
    }
  },
  // Back-compat: the platform-owner surfaces were renamed admin → super-admin.
  // These 307 redirects keep any old /dashboard/admin/* or /api/admin/* URL
  // (bookmarks, external callers, missed links) working. 307 preserves the
  // HTTP method + body, so POST/PUT/DELETE API calls survive the redirect.
  // NOTE: this only rewrites the URL PATH — it does NOT touch the `admin` ROLE
  // (which is the institution administrator, distinct from super_admin).
  async redirects() {
    return [
      { source: '/dashboard/admin', destination: '/dashboard/super-admin', permanent: false },
      { source: '/dashboard/admin/:path*', destination: '/dashboard/super-admin/:path*', permanent: false },
      { source: '/api/admin', destination: '/api/super-admin', permanent: false },
      { source: '/api/admin/:path*', destination: '/api/super-admin/:path*', permanent: false },
    ];
  },
  // Security headers on every response. CSP is omitted here on purpose — it must
  // be tuned against inline scripts/styles and the RAG/embed widgets, so it
  // belongs in its own tested change. These are safe to apply unconditionally.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
  // Proxy all API traffic to the standalone API service. This keeps every
  // relative `/api/...` call (fetch + tRPC + better-auth) same-origin with the
  // web app, so cookies and server-side session checks work without CORS or
  // cross-subdomain cookies. The API remains a separately deployable service;
  // set API_URL to its origin (defaults to the local api dev port).
  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:3002'
    return [
      { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
    ]
  },
  serverExternalPackages: ['mysql2', 'pdf-parse', 'tesseract.js', 'pdf2pic'],
  ...(process.env.TURBOPACK !== '1' ? {
    webpack(config, { isServer, dev }) {
      // Redesign: every `lucide-react` import renders its Phosphor equivalent (src/lib/icons/lucide-shim.tsx).
      // `$` = exact match only, so the shim's own deep import of real lucide is not re-aliased.
      config.resolve.alias = {
        ...config.resolve.alias,
        'lucide-react$': path.resolve(process.cwd(), 'src/lib/icons/lucide-shim.tsx'),
      };
      // Ensure UMD/global wrappers use a Node-safe global
      if (isServer) {
        config.output = config.output || {};
        // Avoid 'self is not defined' in SSR by using globalThis
        // for libraries that expect 'self' or 'window'
        // See: https://webpack.js.org/configuration/output/#outputglobalobject
        // and common SSR vendor issues
        // @ts-ignore
        config.output.globalObject = 'globalThis';
      }


      // NOTE: there used to be a custom optimization.splitChunks here (a "vendors" group over all of node_modules with maxSize 244000). It put the
      // whole dependency tree into the initial load of EVERY route: even /_not-found loaded 142 script files (7.9 MB raw), so the landing page took
      // minutes on a slow connection. Next's default splitting loads only what a route needs.

      if (dev) {
        // Reduce bundle analysis in development
        config.infrastructureLogging = { level: 'warn' }
      }

      // Browser-only polyfill disables for OCR/PDF libs. MUST be scoped to the
      // client compile: applying fs/path/os: false to the SERVER build breaks
      // Next's own internals (next/dist/pages/_document.js), which surfaces as
      // "Module not found: Can't resolve '../shared/lib/utils'" — and blocks
      // outputFileTracingRoot. Keep these inside `if (!isServer)`.
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          canvas: false,
          fs: false,
          path: false,
          os: false,
          crypto: false,
          stream: false,
          util: false,
          buffer: false,
          events: false
        };

        // Fix for pdfjs-dist webpack issues in Next.js 15
        // Prevent "Object.defineProperty called on non-object" error
        config.resolve.alias = {
          ...config.resolve.alias,
          'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.mjs',
        };
      }

      return config;
    }
  } : {})
}

// GlitchTip is self-hosted and needs no source-map upload, so it is disabled
// (also avoids requiring @sentry/cli / an auth token at build time).
export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  silent: true,
  telemetry: false,
  sourcemaps: { disable: true },
  disableLogger: true,
})
