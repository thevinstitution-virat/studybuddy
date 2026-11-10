// src/lib/auth/require-user.ts
// Minimal "must be signed in" guard for API routes that previously had no check at all (Phase 0 lock-down).
//
// Usage:
//   const guard = await requireUser();
//   if (!guard.ok) return guard.response;
//   const { userId } = guard;          // always the SESSION user; never trust a userId from the query or body

import { NextResponse } from 'next/server';
import { getOrgContextOrNull, type OrgContext } from './get-org-context';

export type UserGuardResult =
  | { ok: true; userId: string; ctx: OrgContext }
  | { ok: false; response: NextResponse };

export async function requireUser(): Promise<UserGuardResult> {
  const ctx = await getOrgContextOrNull();
  if (!ctx) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { ok: true, userId: ctx.userId, ctx };
}
