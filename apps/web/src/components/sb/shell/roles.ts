/**
 * Role chrome config for the Study Buddy shell (Redesign Brief §4): which five items sit in the
 * bottom bar / rail, and what the speed-dial offers. The role is read from the URL, so the
 * existing role layouts and their auth guards are untouched. Every href below is a real route.
 */

export type RoleKey = 'student' | 'teacher' | 'parent' | 'institution' | 'super-admin'

export interface Tab { name: string; href: string; icon: string; /** extra path prefixes that keep this tab lit */ also?: string[] }
export interface FabAction { label: string; href: string; icon: string }
export interface RoleConfig { key: RoleKey; label: string; home: string; tabs: Tab[]; actions: FabAction[]; fabLabel: string }

export const ROLES: Record<RoleKey, RoleConfig> = {
  student: {
    key: 'student', label: 'Student', home: '/dashboard/user', fabLabel: 'Ask',
    tabs: [
      { name: 'Home', href: '/dashboard/user', icon: 'home' },
      { name: 'Learn', href: '/dashboard/student', icon: 'learn', also: ['/dashboard/user/materials', '/dashboard/user/practest'] },
      { name: 'Tutor', href: '/dashboard/user/ai-tutor', icon: 'tutor' },
      { name: 'Progress', href: '/dashboard/user/progress', icon: 'progress', also: ['/dashboard/student/progress', '/dashboard/student/my-analytics'] },
    ],
    actions: [
      { label: 'Ask Gyankosh', href: '/dashboard/user/ai-tutor', icon: 'gyankosh' },
      { label: 'Start a Practest', href: '/dashboard/user/practest', icon: 'practest' },
      { label: 'Review flashcards', href: '/dashboard/user/sanchika', icon: 'flashcards' },
      { label: 'Scan handwritten answer', href: '/dashboard/user/inkbuddy', icon: 'scan' },
    ],
  },
  teacher: {
    key: 'teacher', label: 'Teacher', home: '/dashboard/teacher', fabLabel: 'Create',
    tabs: [
      { name: 'Home', href: '/dashboard/teacher', icon: 'home' },
      { name: 'Classes', href: '/dashboard/teacher/classes', icon: 'classes' },
      { name: 'Attendance', href: '/dashboard/teacher/attendance', icon: 'attendance' },
      { name: 'Review', href: '/dashboard/teacher/validation', icon: 'validation' },
    ],
    actions: [
      { label: 'Post a notice', href: '/dashboard/teacher/notices', icon: 'notices' },
      { label: 'Set an assignment', href: '/dashboard/teacher/assignments', icon: 'assignments' },
      { label: 'Schedule live class', href: '/dashboard/teacher/live-classes', icon: 'live' },
      { label: 'Mark attendance', href: '/dashboard/teacher/attendance', icon: 'attendance' },
    ],
  },
  parent: {
    key: 'parent', label: 'Parent', home: '/dashboard/parent', fabLabel: 'Message',
    tabs: [
      { name: 'Home', href: '/dashboard/parent', icon: 'home' },
      { name: 'Progress', href: '/dashboard/parent/progress', icon: 'progress' },
      { name: 'Attendance', href: '/dashboard/parent/attendance', icon: 'attendance' },
      { name: 'Messages', href: '/dashboard/parent/messages', icon: 'messages' },
    ],
    actions: [
      { label: 'Message a teacher', href: '/dashboard/parent/messages', icon: 'messages' },
      { label: 'Pay fees', href: '/dashboard/parent/billing', icon: 'billing' },
      { label: 'Monthly report', href: '/dashboard/parent/reports', icon: 'reports' },
    ],
  },
  institution: {
    key: 'institution', label: 'Institution', home: '/dashboard/institution', fabLabel: 'Add',
    tabs: [
      { name: 'Home', href: '/dashboard/institution', icon: 'home' },
      { name: 'People', href: '/dashboard/institution/students', icon: 'people', also: ['/dashboard/institution/teachers', '/dashboard/institution/join-requests', '/dashboard/institution/guardians'] },
      { name: 'Academics', href: '/dashboard/institution/batches', icon: 'learn', also: ['/dashboard/institution/classes', '/dashboard/institution/content', '/dashboard/institution/assignments'] },
      { name: 'Insights', href: '/dashboard/institution/analytics', icon: 'analytics', also: ['/dashboard/institution/revenue'] },
    ],
    actions: [
      { label: 'Invite a teacher', href: '/dashboard/institution/teachers', icon: 'approvals' },
      { label: 'Enroll students', href: '/dashboard/institution/students', icon: 'students' },
      { label: 'New batch', href: '/dashboard/institution/batches', icon: 'batches' },
    ],
  },
  'super-admin': {
    key: 'super-admin', label: 'Platform', home: '/dashboard/super-admin', fabLabel: 'Add',
    tabs: [
      { name: 'Home', href: '/dashboard/super-admin', icon: 'home' },
      { name: 'Orgs', href: '/dashboard/super-admin/organizations', icon: 'organizations', also: ['/dashboard/super-admin/onboarding', '/dashboard/super-admin/plans'] },
      { name: 'People', href: '/dashboard/super-admin/users', icon: 'people', also: ['/dashboard/super-admin/teacher-verification', '/dashboard/super-admin/join-requests', '/dashboard/super-admin/guardians'] },
      { name: 'Content', href: '/dashboard/super-admin/content', icon: 'content', also: ['/dashboard/super-admin/materials', '/dashboard/super-admin/practest'] },
    ],
    actions: [
      { label: 'Onboard institution', href: '/dashboard/super-admin/onboarding', icon: 'onboard' },
      { label: 'Invite a user', href: '/dashboard/super-admin/users', icon: 'join-requests' },
      { label: 'Upload content', href: '/dashboard/super-admin/content', icon: 'content' },
    ],
  },
}

export function detectRole(pathname: string): RoleConfig {
  if (pathname.startsWith('/dashboard/super-admin')) return ROLES['super-admin']
  if (pathname.startsWith('/dashboard/institution') || pathname.startsWith('/dashboard/admin')) return ROLES.institution
  if (pathname.startsWith('/dashboard/teacher')) return ROLES.teacher
  if (pathname.startsWith('/dashboard/parent')) return ROLES.parent
  return ROLES.student
}

const HOMES = new Set(['/dashboard/user', '/dashboard/teacher', '/dashboard/parent', '/dashboard/institution', '/dashboard/super-admin'])

export function tabActive(tab: Tab, pathname: string): boolean {
  const hit = (h: string) => pathname === h || pathname.startsWith(h + '/')
  // A role's Home tab is exact, or it would swallow every page under it.
  if (HOMES.has(tab.href)) return pathname === tab.href
  return hit(tab.href) || (tab.also ?? []).some(hit)
}

/** Root tab pages get a collapsing bar and the extended FAB; everything else is a subpage with a back arrow. */
export function isRootPage(role: RoleConfig, pathname: string): boolean {
  return role.tabs.some((t) => pathname === t.href)
}

/** Screens that are their own full-screen surface: no FAB (brief §4). */
export function fabHidden(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard/user/ai-tutor') ||
    /^\/dashboard\/user\/practest\/[^/]+/.test(pathname) ||
    /^\/dashboard\/user\/sanchika\/[^/]+/.test(pathname) ||
    pathname.includes('/sign-in')
  )
}

/** Semantic icon for an existing nav item, derived from its label. Falls back to the item's own icon. */
const NAME_RULES: Array<[RegExp, string]> = [
  [/^dashboard$|^home$/, 'home'], [/classroom/, 'classroom'], [/gyankosh|ai tutor|tutor/, 'gyankosh'], [/progress/, 'progress'],
  [/study materials|materials/, 'materials'], [/practest/, 'practest'], [/sanchika|notes/, 'sanchika'], [/shabdakosh|dictionary/, 'shabdakosh'],
  [/sarvagya/, 'sarvagya'], [/mitram/, 'mitram'], [/inkbuddy|evaluator/, 'inkbuddy'], [/productivity/, 'productivity'],
  [/certificate/, 'certificates'], [/analytics|quality|insight/, 'analytics'], [/billing|subscription|pricing/, 'billing'],
  [/purchase|receipt/, 'purchases'], [/profile/, 'profile'], [/classes|class\b/, 'classes'], [/join request/, 'join-requests'],
  [/teacher approvals|teachers|teacher/, 'approvals'], [/students|people/, 'students'], [/users/, 'people'], [/assignment/, 'assignments'],
  [/attendance/, 'attendance'], [/notice/, 'notices'], [/live class|live/, 'live'], [/validation/, 'validation'], [/ward|guardian/, 'wards'],
  [/message/, 'messages'], [/report/, 'reports'], [/organization/, 'organizations'], [/onboard/, 'onboard'], [/plans/, 'plans'],
  [/content/, 'content'], [/batch template|template/, 'templates'], [/batches/, 'batches'], [/video/, 'videos'], [/vector/, 'vector-db'],
  [/performance/, 'performance'], [/revenue/, 'revenue'], [/evaluation/, 'evaluation'], [/taxonomy/, 'taxonomy'], [/zoom/, 'zoom'],
  [/feature/, 'features'], [/integration/, 'integrations'], [/setting/, 'settings'], [/danger/, 'danger'],
]

export function navIconName(name: string): string | undefined {
  const n = name.trim().toLowerCase()
  for (const [re, icon] of NAME_RULES) if (re.test(n)) return icon
  return undefined
}
