'use client'

/**
 * Teacher dashboard — a faithful port of the "Teacher" view in
 * design_handoff_digiclassroom_ui/designs/DigiClassroom Dashboards.dc.html.
 * Renders inside DashboardLayout's `.dcd` shell. Data stays real: the four KPI
 * tiles and the validation panel are fed by the same /api/teacher/* calls the
 * page already made; the getting-started steps and quick-action links are the
 * mock's static guidance. The mock's demo validation-queue rows are intentionally
 * NOT reproduced as fake rows — the panel shows the real pending/approved counts.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Btn, HeroCard, ListRow, PageHeader, RowCard, Rise, Skeleton, StatTile, IconTile } from '@/components/sb'
import { useBetterAuthUser } from '@/hooks/useBetterAuthUser'

interface DashboardStats {
  totalClasses: number
  totalStudents: number
  pendingValidations: number
  approvedValidations: number
}

export default function TeacherDashboardPage() {
  const { user } = useBetterAuthUser()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,'
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    pendingValidations: 0,
    approvedValidations: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const classesRes = await fetch('/api/teacher/classes')
      const classesData = await classesRes.json()

      const studentsRes = await fetch('/api/teacher/students')
      const studentsData = await studentsRes.json()

      const validationRes = await fetch('/api/teacher/validation-queue?status=all')
      const validationData = await validationRes.json()

      setStats({
        totalClasses: classesData.data?.total || 0,
        totalStudents: studentsData.data?.total || 0,
        pendingValidations: validationData.data?.pending || 0,
        approvedValidations:
          validationData.data?.items?.filter((item: { validationStatus?: string }) => item.validationStatus === 'approved').length || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const kpis = [
    { label: 'My classes', value: stats.totalClasses, icon: 'classes', tone: 'lav' as const },
    { label: 'Total students', value: stats.totalStudents, icon: 'students', tone: 'sky' as const },
    { label: 'Pending review', value: stats.pendingValidations, icon: 'validation', tone: 'butter' as const },
    { label: 'Approved', value: stats.approvedValidations, icon: 'check-circle', tone: 'saf' as const },
  ]

  const actions = [
    { icon: 'classes', tone: 'lav' as const, title: 'Create a class', desc: 'Set up subject, grade and section', href: '/dashboard/teacher/classes' },
    { icon: 'students', tone: 'sky' as const, title: 'Manage students', desc: 'Assign students to your classes', href: '/dashboard/teacher/students' },
    { icon: 'validation', tone: 'butter' as const, title: 'Validate content', desc: 'Review AI-generated questions', href: '/dashboard/teacher/validation' },
    { icon: 'notices', tone: 'rose' as const, title: 'Post a notice', desc: 'Tell a class what is happening', href: '/dashboard/teacher/notices' },
    { icon: 'assignments', tone: 'saf' as const, title: 'Set an assignment', desc: 'Written work, marked by AI if you wish', href: '/dashboard/teacher/assignments' },
    { icon: 'attendance', tone: 'stone' as const, title: 'Mark attendance', desc: 'One tap per student', href: '/dashboard/teacher/attendance' },
  ]

  const steps = [
    { n: '1', title: 'Create your first class', desc: 'Set up subject, grade level and section details.' },
    { n: '2', title: 'Add students to your class', desc: 'Assign students to start teaching.' },
    { n: '3', title: 'Review and validate content', desc: 'Improve AI content by validating questions.' },
  ]

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 16 }} aria-busy>
        <Skeleton height={64} style={{ maxWidth: 420 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={120} />)}</div>
        <Skeleton height={200} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Rise><PageHeader kicker="Teacher" title={hello} highlight={firstName} /></Rise>

      <Rise i={1}>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14 }}>
          {kpis.map((k) => <StatTile key={k.label} value={k.value} label={k.label} icon={k.icon} tone={k.tone} />)}
        </section>
      </Rise>

      <Rise i={2}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 16 }}>
          <HeroCard>
            <div className="sb-kicker" style={{ color: '#FF9933' }}>Validation queue</div>
            <div style={{ fontFamily: 'var(--sb-font-display)', fontWeight: 700, fontSize: 56, lineHeight: 1, letterSpacing: '-.04em', margin: '10px 0 4px' }}>{stats.pendingValidations}</div>
            <p style={{ margin: 0, color: '#A9AEC6', fontSize: 15 }}>Questions and materials waiting for your review. Nothing reaches students until you approve it.</p>
            <div style={{ marginTop: 20 }}><Btn kind="accent" href="/dashboard/teacher/validation" icon="arrow">Review queue</Btn></div>
          </HeroCard>
          <RowCard title="Getting started">
            {steps.map((st) => (
              <ListRow key={st.n} icon="check-circle" tone="stone" title={st.title} sub={st.desc} />
            ))}
          </RowCard>
        </div>
      </Rise>

      <section>
        <h2 style={{ margin: '0 0 14px', fontSize: 22 }}>Quick actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 12 }}>
          {actions.map((a) => (
            <Link key={a.title} href={a.href} style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18, borderRadius: 24, background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', color: 'var(--sb-ink)', textDecoration: 'none' }}>
              <IconTile icon={a.icon} tone={a.tone} size={56} />
              <span>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 16 }}>{a.title}</span>
                <span style={{ display: 'block', fontSize: 13, color: 'var(--sb-muted)', fontWeight: 600, marginTop: 2 }}>{a.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
