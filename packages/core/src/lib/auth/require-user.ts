// src/lib/auth/require-user.ts
// "Must be signed in" guard for API routes that previously had no check at all (Phase 0 lock-down).
//
// Usage:
//   const guard = await requireUser();
//   if (!guard.ok) return guard.response;
//   const { userId } = guard;          // always the SESSION user; never trust a userId from the query or body
//
// IMPORTANT: this checks the SESSION only. It must NOT require an active organization: B2C students (the
// default Study Buddy user) have no org, and getOrgContext() throws for them. The first version of this guard
// went through getOrgContextOrNull() and so returned 401 to every independent student.

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSafeSession } from '@/auth';

export type UserGuardResult =
  | { ok: true; userId: string; role: string }
  | { ok: false; response: NextResponse };

export async function requireUser(): Promise<UserGuardResult> {
  const session = await getSafeSession(await headers());
  if (!session?.user?.id) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { ok: true, userId: session.user.id, role: String((session.user as { role?: string }).role ?? 'student') };
}
