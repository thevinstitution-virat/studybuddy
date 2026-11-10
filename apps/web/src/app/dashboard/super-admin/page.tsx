'use client'

// Super-admin platform overview — a faithful port of the "Super-Admin" view in
// design_handoff_digiclassroom_ui/designs/DigiClassroom Dashboards.dc.html,
// rendered inside DashboardLayout's `.dcd` shell. Every figure stays real: the
// stat tiles come from /api/super-admin/overview, the institutions list from
// /api/super-admin/organizations/list, and the revenue chart from the real
// <SARevenueClient/> (the mock's demo revenue bars are its stand-in).
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SARevenueClient } from '@/components/super-admin/SARevenueClient'
import { Chip, IconTile, ListRow, PageHeader, RowCard, Rise, Skeleton, StatTile, type Tone } from '@/components/sb'

interface Overview {
  institutions: number; users: number; students: number; teachers: number
  institutionAdmins: number; parents: number
}
interface OrgRow {
  id: string; name: string; slug: string; type: string; plan: string | null
  status: string; members: number; onboardingCompleted: boolean
  enabledFeatures: number; allowedFeatures: number
}

const statusTone: Record<string, Tone | 'danger' | 'navy'> = { active: 'navy', trial: 'butter', suspended: 'danger', cancelled: 'stone' }

export default function AdminDashboard() {
  const [ov, setOv] = useState<Overview | null>(null)
  const [orgs, setOrgs] = useState<OrgRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/super-admin/overview').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/super-admin/organizations/list').then((r) => (r.ok ? r.json() : { organizations: [] })),
    ])
      .then(([o, list]) => { setOv(o); setOrgs(list?.organizations ?? []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { name: 'Institutions', value: ov?.institutions ?? 0, icon: 'organizations', tone: 'lav' as Tone },
    { name: 'Total users', value: ov?.users ?? 0, icon: 'people', tone: 'sky' as Tone },
    { name: 'Students', value: ov?.students ?? 0, icon: 'students', tone: 'saf' as Tone },
    { name: 'Institution admins', value: ov?.institutionAdmins ?? 0, icon: 'validation', tone: 'butter' as Tone },
  ]
  const quickActions = [
    { name: 'Onboard institution', desc: 'Create a new institution', href: '/dashboard/super-admin/onboarding', icon: 'onboard', tone: 'lav' as Tone },
    { name: 'Organizations', desc: 'Manage all institutions', href: '/dashboard/super-admin/organizations', icon: 'organizations', tone: 'sky' as Tone },
    { name: 'Subscription plans', desc: 'Billing and plans', href: '/dashboard/super-admin/plans', icon: 'plans', tone: 'saf' as Tone },
    { name: 'Feature flags', desc: 'Platform toggles', href: '/dashboard/super-admin/feature-flags', icon: 'features', tone: 'butter' as Tone },
    { name: 'Content', desc: 'NCERT and ingestion', href: '/dashboard/super-admin/content', icon: 'content', tone: 'stone' as Tone },
    { name: 'Danger zone', desc: 'Destructive operations', href: '/dashboard/super-admin/danger-zone', icon: 'danger', tone: 'rose' as Tone },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Rise><PageHeader kicker="Platform" title="Platform" highlight="overview" description="Institutions, people and revenue across Study Buddy." /></Rise>

      <Rise i={1}>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14 }}>
          {stats.map((s) => (
            loading
              ? <Skeleton key={s.name} height={128} />
              : <StatTile key={s.name} value={s.value.toLocaleString()} label={s.name} icon={s.icon} tone={s.tone} />
          ))}
        </section>
      </Rise>

      <Rise i={2}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))', gap: 16, alignItems: 'start' }}>
          <RowCard
            title={`Institutions${orgs.length ? ` · ${orgs.length}` : ''}`}
            action={<Link href="/dashboard/super-admin/organizations" style={{ fontSize: 13.5, fontWeight: 800 }}>View all →</Link>}
          >
            {loading ? (
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={56} />)}</div>
            ) : orgs.length === 0 ? (
              <div style={{ padding: '36px 22px', textAlign: 'center' }}>
                <p style={{ fontSize: 15, color: 'var(--sb-muted)', margin: '0 0 8px' }}>No institutions yet.</p>
                <Link href="/dashboard/super-admin/onboarding" style={{ fontWeight: 800 }}>Onboard your first institution →</Link>
              </div>
            ) : (
              orgs.map((o) => (
                <ListRow
                  key={o.id}
                  icon="organizations"
                  tone="lav"
                  title={o.name}
                  sub={`${o.type?.replace('_', ' ')} · ${o.members} members`}
                  trailing={<span style={{ display: 'flex', gap: 6, flex: 'none' }}>{o.plan && <Chip tone="saf" style={{ textTransform: 'capitalize' }}>{o.plan}</Chip>}<Chip tone={statusTone[o.status] ?? 'stone'} style={{ textTransform: 'capitalize' }}>{o.status}</Chip></span>}
                />
              ))
            )}
          </RowCard>

          <section>
            <h2 style={{ margin: '4px 0 12px', fontSize: 22 }}>Quick actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 10 }}>
              {quickActions.map((a) => (
                <Link key={a.name} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 22, background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', color: 'var(--sb-ink)', textDecoration: 'none' }}>
                  <IconTile icon={a.icon} tone={a.tone} size={46} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 800, fontSize: 14.5 }}>{a.name}</span>
                    <span style={{ display: 'block', fontSize: 12.5, color: 'var(--sb-muted)', fontWeight: 600 }}>{a.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </Rise>

      {/* Revenue analytics — real captured-payments chart */}
      <section className="card" style={{ padding: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Revenue analytics</h2>
        <p style={{ margin: '4px 0 20px', color: 'var(--sb-muted)', fontSize: 14 }}>Platform-wide · all institutions · captured payments only</p>
        <SARevenueClient />
      </section>
    </div>
  )
}
