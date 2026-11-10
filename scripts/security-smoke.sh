#!/usr/bin/env bash
# Security smoke test: run against a deployed API host after every deploy.
#   scripts/security-smoke.sh https://api.studybuddy.vinstitution.com
#   scripts/security-smoke.sh https://api.host https://web.host   (web host defaults to the API host minus "api.")
# Read-only (GET / HEAD, plus POSTs with an empty body that must be rejected). Exits non-zero if anything that
# must be closed is reachable. Phase 0 lock-down regression guard.
set -u
HOST="${1:?usage: security-smoke.sh https://api.host}"
fail=0

expect() { # expect <METHOD> <path> <comma-separated allowed codes>
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 -X "$1" "$HOST$2")
  if [[ ",$3," == *",$code,"* ]]; then printf 'ok    %-5s %-45s %s\n' "$1" "$2" "$code"
  else printf 'FAIL  %-5s %-45s got %s, want %s\n' "$1" "$2" "$code" "$3"; fail=1; fi
}

echo "== must be removed or blocked (404)"
for p in /api/test/advanced-components /api/test-ocr /api/test-multi-modal /api/debug-sentry /api/dev/reset-quota \
         /api/experiments/list /api/ground-truth/list /api/ragas/evaluate /api/dictionary/test /api/dictionary/init \
         /api/mitram/assessments /api/curricutimer/sessions /api/quiz/categories; do
  expect GET "$p" 404
done

echo "== must require sign-in (401/403)"
for p in "/api/user/progress?userId=x" /api/dictionary/search?q=a /api/dictionary/external-search?q=a /api/dictionary/enhanced-search?q=a \
         /api/health/agents /api/health/workers /api/ai/health /api/feedback/stats /api/audio/abc /api/dictionary/migrate; do
  expect GET "$p" 401,403
done
for p in /api/file-processing /api/feedback/submit /api/performance/profile /api/dictionary/translate; do
  expect POST "$p" 401,403
done

echo "== webhooks must reject unsigned calls"
expect POST /api/webhooks/razorpay 400,503
expect POST /api/webhooks/bunny 401

echo "== public and healthy"
expect GET /api/health 200

echo "== signed-in B2C student must NOT be locked out (set SMOKE_COOKIE='better-auth.session_token=...' to run)"
if [[ -n "${SMOKE_COOKIE:-}" ]]; then
  for p in /api/user/progress "/api/dictionary/search?q=cat" /api/user/subscription /api/ai/chat/usage; do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 -H "Cookie: $SMOKE_COOKIE" "$HOST$p")
    if [[ "$code" == 200 ]]; then echo "ok    GET   $p  200 (signed in)"; else echo "FAIL  GET   $p  expected 200 signed-in, got $code"; fail=1; fi
  done
else
  echo "skip  (no SMOKE_COOKIE) - a guard that 401s signed-in students looks identical to a working one without this"
fi

echo "== headers"
h=$(curl -sI --max-time 20 "$HOST/api/health")
echo "$h" | grep -qi '^content-security-policy:' && echo "ok    CSP present" || { echo "FAIL  CSP missing"; fail=1; }
echo "$h" | grep -qi '^x-powered-by:' && { echo "FAIL  X-Powered-By still sent"; fail=1; } || echo "ok    no X-Powered-By"

# The WEB host has its own headers. Only the API was checked before, which is how "X-Powered-By: Next.js"
# stayed on every page while this script passed. Second argument, or derived by dropping the "api." label.
WEB="${2:-${HOST/:\/\/api./://}}"
if [[ "$WEB" != "$HOST" ]]; then
  echo "== web host headers ($WEB)"
  for p in / /sign-in; do
    w=$(curl -sI --max-time 20 "$WEB$p")
    echo "$w" | grep -qi '^x-powered-by:' && { echo "FAIL  $p  X-Powered-By still sent"; fail=1; } || echo "ok    $p  no X-Powered-By"
    echo "$w" | grep -i '^content-security-policy:' | grep -q "script-src" && echo "ok    $p  CSP has script-src" || { echo "FAIL  $p  CSP has no script-src"; fail=1; }
    echo "$w" | grep -i '^content-security-policy:' | grep -q "script-src-attr 'none'" && echo "ok    $p  inline event handlers blocked" || { echo "FAIL  $p  CSP lacks script-src-attr 'none'"; fail=1; }
  done
else
  echo "skip  web host headers (pass the web URL as the second argument)"
fi

[[ $fail -eq 0 ]] && echo "ALL CHECKS PASSED" || echo "SECURITY SMOKE FAILED"
exit $fail
