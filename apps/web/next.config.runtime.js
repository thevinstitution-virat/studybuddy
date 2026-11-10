// Runtime-only Next config for the production image (the Dockerfile copies it to next.config.js).
//
// `next start` reads a config file when the server starts. The image cannot use next.config.ts for that: it
// would need TypeScript and the build-time wrappers (@next/bundle-analyzer is a dev dependency and is pruned).
// Without any config file the server ran on defaults, which is why "X-Powered-By: Next.js" came back.
//
// Only settings the SERVER reads at start belong here. Headers, redirects and rewrites are compiled into
// .next/routes-manifest.json by `next build` from next.config.ts and need nothing here.
/** @type {import('next').NextConfig} */
module.exports = {
  poweredByHeader: false,
}
