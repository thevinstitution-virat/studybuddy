# Study Buddy: readiness audit (2026-11-10)

Scope: code of `main` (b6f2fbd), the live stack at studybuddy.vinstitution.com / api.studybuddy.vinstitution.com, its server logs and database. Probing was read-only (GET). No data was changed. Pages behind login were not exercised in a browser (no real account for a full walkthrough).

**Verdict: not ready for public users.** The shell, auth and design are in good shape. The product itself is empty and several services are mock or unprovisioned. Four things must be fixed before anyone is invited.

## 1. Mock and placeholder data

| Area | What is fake | Evidence |
|---|---|---|
| Mitram (aptitude) | Whole service: modules, questions, scoring, percentiles, results and notifications live in in-memory objects (`mockDatabase`, `mockResultsDB`, `mockNotificationDB`), seeded with fake results | `apps/api/.../mitram/*`, `user/mitram/page.tsx` (mockModules, mockProgress) |
| Productivity (CurriculTimer) | Sessions, engagement and exam dates in in-memory Maps: lost on every restart and **shared across all users** | `apps/api/.../curricutimer/*` |
| Quiz | Categories, sessions, spaced-repetition cards and answers are mock; hard-coded `mock_user_id`, `correctAnswer: 'mock_correct_answer'` | `apps/api/.../quiz/*`, `components/quiz`, `components/learning/quiz` (duplicate trees) |
| Materials page | Hard-coded list of sample materials instead of the materials API | `user/materials/page.tsx` line 168 |
| Shabdakosh | "Word of the day" and "Recent words" are mock constants; Wordnik / Merriam-Webster lookups are stubs | `user/dictionary/page.tsx` 279-310, `dictionary/external-search` |
| Super-admin settings | Toggles labelled "(Mock)" (backup, registration, guest access, alerts) do nothing | `super-admin/settings/page.tsx` |
| Pricing | "TODO: integrate Razorpay/Stripe"; Sarvagya store shows an `alert()` instead of checkout | `user/pricing/page.tsx:242`, `sarvagya/store/page.tsx:61` |
| Landing / app copy | Mock figures inside product screens (intentional, as in the design). Fixed this week: invented Practest stats, student-home stats | n/a |

Rule for launch: a user must never reach a screen that returns invented data. Either build it or hide it behind a feature flag.

## 2. Security findings

### Critical
- **C1. Unauthenticated API routes on the public API host** (the web app's middleware does not protect `api.studybuddy…`). Confirmed live with GET:
  - `GET /api/user/progress?userId=<any>`: no login; returns any user's AI usage, and the daily chart is not even filtered by user (leaks platform-wide activity).
  - `POST /api/file-processing`: anonymous OCR/file processing (CPU and cost abuse).
  - `POST /api/dictionary/init`, `/migrate`, `/seed-more-words`: anonymous database writes.
  - `POST /api/feedback/submit`, `GET /api/feedback/stats`, `/api/experiments/*`, `/api/ground-truth/*`, `/api/ragas/*`, `/api/performance/profile`, `/api/quiz/*`, `/api/curricutimer/schedule`: no auth.
  - Diagnostics open to the world: `/api/test/*`, `/api/test-ocr`, `/api/test-multi-modal`, `/api/dictionary/test*`, `/api/health/agents`, `/api/health/workers`. They disclose DB state, feature flags and upstream status. `/api/debug-sentry` throws a test error on demand (spams the error tracker).
- **C2. Razorpay webhook falls back to the secret `'dummy_webhook_secret'`** when `RAZORPAY_WEBHOOK_SECRET` is unset (it is unset on this stack), so a forged webhook would verify. Payments are not integrated yet, but this must be removed before they are.
- **C3. Vulnerable dependencies. RESOLVED in Phase 0 / 0b (now 0 critical, 0 high; 17 moderate, 1 low remain).** At audit time (`npm audit --omit=dev`: 6 critical, 23 high, 57 moderate): `next` 15.3.9 (SSRF via middleware redirects, image-optimizer cache confusion; fixed in 15.5.29), `better-auth` (<=1.7.6), `dompurify` (<=3.4.16, XSS bypasses, and it sanitises AI output), `jspdf` (<=4.2.0), `proxy-addr` (IP spoofing, undermines rate limiting).

### High / Medium
- **H1.** Web container holds server secrets it does not need (OpenAI, Resend, Azure, Google client secret). Least privilege: only the API should have them.
- **H2.** No Content-Security-Policy. `X-Powered-By: Next.js` is exposed. (HSTS, nosniff, frame options, referrer and permissions policies are present.)
- **H3.** Rate limiting exists only on auth and 3 API files. AI endpoints rely on a per-user daily quota; there is no per-IP limit on public routes.
- **M1.** `assign-role` guesses a teacher/guardian persona from email aliases (`teacher.`, `parent.`): anyone can pick a persona by choosing an email. Role stays `user`, but verify nothing grants access on persona alone.
- **M2.** Bunny webhook compares its key with `!==` (not constant-time). Low impact.
- **M3.** `RichTextEditor` injects saved ink SVG with `dangerouslySetInnerHTML` unsanitised (self-XSS only today; becomes real if notes become shareable).
- **M4.** Public health endpoints and verbose error bodies (`details:` with SQL text) leak internals.

### Verified good
Roles cannot be set by clients (`role` is `input:false`; super_admin only for the configured owner email); email verification is required; auth rate limiting is on; cross-subdomain cookies and CORS use an explicit origin list (never `*` with credentials); tRPC is protected except the four read-only taxonomy lists; no secret-shaped strings are tracked in git; `k8s/secrets.yaml` holds placeholders only; Razorpay HMAC check exists (apart from C2); AI answers pass through DOMPurify (apart from the dependency issue in C3); TLS/HSTS is enforced.

## 3. Service-by-service status

| Service | Status | Why |
|---|---|---|
| Sign-up / sign-in / reset | Works (not fully walked) | Email verification via Resend; Google client verified to start; super-admin account not yet created (owner has not signed in) |
| Google sign-in | Untested end to end | New client ID set; needs one real login |
| Virat Gyankosh (AI tutor) | **Broken for users** | Qdrant collection `study_buddy_chunks_v1` does not exist and no content is ingested; every query ends in "knowledge gap". API logs show a failing search loop. |
| Practest | **Empty** | 0 questions / 0 content; generation depends on ingested content |
| Shabdakosh | **Broken** | `dictionary_words` table does not exist (created by an unauthenticated init route); page shows mock word of day |
| InkBuddy / handwritten evaluator | **Off** | Feature flag off; image uploads need R2 (not configured) |
| Sanchika (notes / flashcards) | Likely works | Tables exist; flashcards depend on saved AI answers (none possible yet); not exercised |
| Study Materials | **Mock** | Page ignores the API; no materials; uploads need R2 |
| Progress / analytics | Partial | Real endpoints, but all empty; `user/progress` API is insecure (C1) |
| Mitram | **Mock** | See section 1 |
| Productivity (CurriculTimer) | **Mock, shared state** | See section 1 |
| Quiz | **Mock** | See section 1 |
| Sarvagya (document AI) | **Not deployed** | Page and store exist; service absent; checkout is an alert |
| Payments / plans / invoices | **Not available** | No Razorpay env; pricing "TODO"; webhook insecure default |
| Email | Configured | Resend key reused from Digi Classroom; sender "Study Buddy"; deliverability not tested |
| File storage (R2) | **Not configured** | Keys empty |
| Live classes / Zoom / video (Bunny) | **Not configured** | No env; video library unusable |
| Teacher / parent / institution / admin consoles | Built, empty | No organisations, classes or users; join / invite flows untested |
| Monitoring | Working | GlitchTip frontend + backend receive events; no alert rules; test error mislabelled `dgcl-backend`; no Sentry `global-error` handler |
| Backups | **Missing** | Nightly backups exist for other apps, none for the Study Buddy database or Qdrant |
| Database | Healthy | Schema identical to Digi Classroom prod (125 tables); 1 user (demo student) |

## 4. Other bugs and gaps
- `feedback/stats` fails with a SQL syntax error (`near "24"`); `experiments`, `ground_truth_dataset` tables are missing (500s).
- `/privacy`, `/terms`, cookie policy links are `#`. Students are minors: no consent / guardian flow or DPDP notice.
- Footer contact email is Digi Classroom's (support@mydigiclassroom.com).
- Dead / duplicate code: `EnhancedLandingPage` (2 copies), `components/quiz` and `components/learning/quiz`, MySQL-era dictionary code, legacy k8s manifests, 143 pre-existing TypeScript errors, TS build errors ignored.
- Icon layer adds about 90 kB to every page's first load.
- No automated end-to-end tests for the core loop; no CI gate.
- Pages behind login have not been reviewed on real phones.

## 5. Roadmap

**Phase 0: lock down (1-2 days, do first)**
1. API allowlist at the edge: block `/api/test*`, `/api/debug*`, `/api/dev*`, `/api/dictionary/{init,migrate,seed-more-words,test*}`, `/api/experiments`, `/api/ground-truth`, `/api/ragas` in production (middleware), then delete the routes.
2. Put `auth()` on `user/progress` (use the session user, ignore `userId`), `file-processing`, `feedback/*`, `performance/profile`, `quiz/*`, `curricutimer/*`; add per-IP rate limits.
3. Remove the Razorpay `dummy_webhook_secret` fallback (fail closed); constant-time compares.
4. Upgrade `next` (15.5.x), `better-auth`, `dompurify`, `jspdf`, `proxy-addr`; re-run audit; deploy.
5. Add CSP + `poweredByHeader:false`; remove server secrets from the web container.
6. Nightly Postgres + Qdrant backups with a tested restore.
7. Hide unfinished features (Mitram, Productivity, Quiz, Sarvagya, Materials mock, dictionary mock widgets) behind feature flags so users never see mock data.

**Phase 1: make the core loop real (week 1)**
1. Configure R2 (bucket + key) and verify uploads.
2. Ingest NCERT chapters through the library hub so Qdrant is populated; check citations end to end in Gyankosh.
3. Generate / import a Practest question bank; verify run + results.
4. Provision Shabdakosh tables via a proper migration (not an open route) and load real word data; word of the day from the database.
5. Replace the Materials mock with the real API.
6. Create the super-admin account; run the full Google login; smoke-test every role.

**Phase 2: commercial and trust (week 2)**
1. Razorpay: orders, verified webhook, plan activation, invoices with GST, refunds (7-day policy).
2. Privacy Policy, Terms, cookie notice, guardian-consent flow for minors (DPDP).
3. Decide Mitram / Productivity: build on real tables or drop; same for Quiz and Sarvagya.
4. Real support email, transactional email templates, deliverability check (SPF/DKIM/DMARC).

**Phase 3: hardening and launch gate (weeks 3-4)**
1. End-to-end tests (Playwright) for sign-up, tutor question, Practest, InkBuddy, payment, teacher approval; CI gate.
2. Load test AI endpoints; per-user + per-IP limits; cost alerts on OpenAI/OpenRouter.
3. GlitchTip alert rules; uptime monitoring; log retention; incident runbook.
4. Mobile pass on real phones; Lighthouse (a11y >= 95); trim icon bundle; delete dead code; fix TypeScript errors.
5. Staged invite (founding cohort) before public launch.

**Launch gate (all must be true):** no unauthenticated data routes; payments verified end to end; Gyankosh answers with citations from real content; every visible feature is real; backups restored once; legal pages live; critical/high dependency advisories closed.


## 6. Phase 0 status (2026-11-10, PR #4)

Done: open API routes closed or deleted; `user/progress` scoped to the session user; Razorpay webhook fail-closed; mock Razorpay orders refused in production; CSP + no `X-Powered-By`; server secrets blanked on the web service; mock data removed from Materials and Shabdakosh; Mitram / Productivity / Quiz / Sarvagya hidden; nightly Postgres + Qdrant backups with a restore test (125 tables restored); `scripts/security-smoke.sh` regression check.

Dependencies: critical 6 -> 0 and high 23 -> 0 (moderate 57 -> 17). Upgrades: next 15.5.29, better-auth 1.7.19, dompurify 3.4.17, jspdf 4.2.1, zod 3 -> 4.6.7 (all workspaces + root), openai 4 -> 7.55, @hookform/resolvers 3 -> 5, tiptap 3.33, sharp 0.35.5 and postcss 8.5.32 via overrides. Removed: `minio` (unused) and `@xenova/transformers` (ONNX reranker was already off in production because it crashed the process; the reranker now fails closed to the dense/RRF order). zod 4 migration: `z.record` key types, `.errors` -> `.issues`, `required_error` -> `error`, `_type` -> `z.infer`. Type-error counts did not rise (API 21 = 21, web 141 vs 142).

Known gaps left for later phases: 8 older jest suites fail to start (module-path mapping in the monorepo jest config, unrelated to the upgrades) and 3 formatting tests fail; the remaining 17 moderate advisories; script-src in the CSP; end-to-end runtime verification of zod 4 against a live database after deploy.

## 7. Second hardening pass (2026-11-10, after PR #8)

Closed:
- **Role self-assignment (new finding).** `POST /api/assign-role` wrote the `role` from the request body to the caller's account (`{ manualAssignment: true, role: "admin" }`); only `super_admin` was refused. It needs an organisation membership to reach, so it was not exploitable on live (no organisations exist yet), but any student of the first school to join could have made themselves an institution admin or teacher. The role is now server-decided and an existing role is never changed here. The email-alias persona guess (M1) is removed with it.
- **H2 `X-Powered-By`.** The web image shipped without a Next config, so `next start` ran on defaults and sent the header on every page (the smoke script only checked the API host). The image now carries `next.config.runtime.js`; the smoke script checks the web host too.
- **H2 CSP `script-src`.** Host allowlist (`'self'`, jsdelivr for MathJax, YouTube, Razorpay) plus `script-src-attr 'none'`, which blocks inline event handlers. `'unsafe-inline'` remains for script elements (see Open).
- **H3 burst limit.** 30 write requests per minute per session across the model, OCR, speech and translate endpoints (API middleware, in memory).
- **M3 ink SVG.** Sanitised with DOMPurify (SVG profile) before it is rendered or re-saved.
- **M4 verbose errors.** 48 route files no longer return `error.message` on unexpected errors in production (`lib/http/public-error.ts`). Super-admin routes keep the full text: the caller is the owner and needs it to debug ingestion.
- **M2** was already fixed in Phase 0 (the Bunny webhook compares with `timingSafeEqual`).
- **mermaid 11.16.0 -> 11.17.2** (prototype pollution, CSS injection, two DoS advisories). It renders model output.

Open:
- **Nonce-based CSP.** `'unsafe-inline'` is still allowed for script elements because pages are statically rendered. Removing it needs per-request nonces and `'strict-dynamic'`, which makes every page dynamic.
- **Per-IP limits.** The burst limit is per session. A per-IP limit needs the real client IP, and the web app proxies API calls, so every user would share one address; it has to be done at the proxy (Traefik).
- **16 moderate advisories**, none in code that handles user input at runtime: `esbuild` / `drizzle-kit` (dev server only), `@sentry/*` via `glob` (build time), `@tailwindcss/typography` (build time), `googleapis` / `uuid` (fix is a major upgrade), `fast-copy` via `pino-pretty`. KaTeX (low) has no non-breaking fix.
- Legal pages and guardian consent (content needed from the owner).

## 8. Sign-in limits were one counter for the whole site (2026-11-10)

Found on live after PR #9. better-auth limits each client address to 8 sign-ins, 5 sign-ups and 120 other auth calls (session checks included) per minute. The web app proxied `/api` to the API's PUBLIC host, so the API saw the web container as the client for every visitor: after one machine used its 8 sign-in tries, a first attempt from a different machine got 429. Anyone could lock all users out of signing in with 8 bad attempts a minute, and one busy classroom would have hit the caps by itself. Calls made straight to the API host were already counted per real address, and forged `X-Forwarded-For` headers did not get round either path.

Fix: the web proxy now calls the API on the stack's private network (`API_URL: http://api:3000` in `docker-compose.coolify.yml`), so the API receives the `X-Forwarded-For` that the edge proxy set from the real visitor.

Still open here: there is no per-account lockout, CAPTCHA or two-factor sign-in, and a school behind one public address shares one counter (8 sign-ins a minute for the whole lab). The limits in `packages/core/src/auth/index.ts` need a decision before a school pilot.
