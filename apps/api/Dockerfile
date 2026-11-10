# ============================================================================
# Study Buddy — api (backend) — headless Next.js standalone, monorepo build.
# Build CONTEXT must be the REPO ROOT (so packages/* are available).
# In Coolify: Build Pack = Dockerfile, Base Directory = / ,
#   Dockerfile Location = apps/api/Dockerfile, Ports Exposes = 3000.
# All secrets/backend config are RUNTIME env (see apps/api/.env.example).
# ============================================================================

# ---- deps ------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
ENV HUSKY=0
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm ci --include=dev

# ---- builder ---------------------------------------------------------------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
ENV HUSKY=0 NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
# Copy the WHOLE installed tree (root + each workspace's own node_modules). npm nests a package under a
# workspace when versions differ (e.g. better-auth, zod); copying only the root node_modules loses them.
COPY --from=deps /app ./
COPY . .

# next build imports every route to collect page data, and OpenAIService.getInstance() runs at
# module scope, so it throws without a key. A PLACEHOLDER for this one RUN only: it is not an
# ENV, so it never reaches the runtime stage; the real key is a runtime variable.
RUN OPENAI_API_KEY=build-time-placeholder npm run build --workspace=@repo/api

# ---- runner (production) ----------------------------------------------------
FROM node:20-alpine AS production
# Python3 is kept in the runtime image: the API shells out to the PDF-extract
# scripts under apps/api/src/python.
RUN apk add --no-cache curl ca-certificates tzdata libc6-compat python3
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1 \
    TZ=UTC
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/api/public ./apps/api/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/.next/static ./apps/api/.next/static

RUN mkdir -p /app/apps/api/uploads /app/apps/api/logs /app/apps/api/tmp && \
    chown -R nextjs:nodejs /app/apps/api/uploads /app/apps/api/logs /app/apps/api/tmp
USER nextjs

EXPOSE 3000

CMD ["node", "apps/api/server.js"]
