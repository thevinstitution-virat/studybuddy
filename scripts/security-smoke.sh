#!/usr/bin/env bash
# Security smoke test: run against a deployed API host after every deploy.
#   scripts/security-smoke.sh https://api.studybuddy.vinstitution.com
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

echo "== headers"
h=$(curl -sI --max-time 20 "$HOST/api/health")
echo "$h" | grep -qi '^content-security-policy:' && echo "ok    CSP present" || { echo "FAIL  CSP missing"; fail=1; }
echo "$h" | grep -qi '^x-powered-by:' && { echo "FAIL  X-Powered-By still sent"; fail=1; } || echo "ok    no X-Powered-By"

[[ $fail -eq 0 ]] && echo "ALL CHECKS PASSED" || echo "SECURITY SMOKE FAILED"
exit $fail
