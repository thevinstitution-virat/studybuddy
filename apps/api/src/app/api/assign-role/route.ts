import { NextRequest, NextResponse } from 'next/server'
import { getOrgContextOrNull } from '@/lib/auth/get-org-context'
import { db } from '@/db'
import { user as userTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { UserRole, UserPersona } from '@/lib/validations'
import { isDesignatedSuperAdmin, sanitizeRole } from '@/lib/auth/super-admin-guard'

const DEFAULT_ROLE: UserRole = 'user'

const PERSONAS: UserPersona[] = ['student', 'teacher', 'guardian']

// SECURITY: the role comes from the server only. This used to guess a teacher / guardian persona from
// email aliases ("teacher.", "parent.") and, worse, to write whatever `role` the request body asked for
// (see POST below). Neither is trustworthy: anyone can pick an email, and anyone can craft a body.
function roleFor(email: string): UserRole {
  // super_admin is ONLY ever the configured platform owner.
  return isDesignatedSuperAdmin(email) ? 'super_admin' : DEFAULT_ROLE
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getOrgContextOrNull()

    if (!ctx) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId } = ctx;

    const body = await request.json().catch(() => ({}))
    // The persona is a display preference only (it is not stored here and grants nothing), so the caller
    // may choose it. The ROLE is never read from the body: this route used to accept
    // { manualAssignment: true, role: 'admin' } from any signed-in member of an organisation and write it
    // to their account, so a school's student could make themselves an institution admin or a teacher.
    const persona: UserPersona = PERSONAS.includes(body?.persona) ? body.persona : 'student'

    // Fetch user from DB
    const users = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1)
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const user = users[0]

    // An account that already has a role keeps it. Changing roles is the super-admin route's job.
    const existingRole = user.role as UserRole
    if (existingRole) {
      return NextResponse.json({
        success: true,
        role: existingRole,
        persona,
        message: `User already has role: ${existingRole}`
      })
    }

    if (!user.email) {
      return NextResponse.json(
        { error: 'No email address found' },
        { status: 400 }
      )
    }

    const assignedRole = sanitizeRole(roleFor(user.email), user.email, DEFAULT_ROLE) as UserRole

    await db.update(userTable).set({
      role: assignedRole,
      updatedAt: new Date(),
    }).where(eq(userTable.id, userId))

    return NextResponse.json({
      success: true,
      role: assignedRole,
      persona,
      message: `Assigned role: ${assignedRole} with persona: ${persona}`
    })

  } catch (error) {
    console.error('Role assignment API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Role assignment failed',
        role: 'user',
        persona: 'student'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Role assignment API is active',
    timestamp: new Date().toISOString()
  })
}
