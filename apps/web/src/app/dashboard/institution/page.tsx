'use client'

// Institution home (Redesign Brief §7.4). The real <AnalyticsDashboard/> stays the source of the
// enrollment / batch / video KPIs; the quick links are built from the real INSTITUTION_NAV and
// restyled as pastel tiles so every one routes to its real page.
import Link from 'next/link'
import { INSTITUTION_NAV } from '@/lib/dashboard/dashboard-nav'
import { AnalyticsDashboard } from '@/components/institution/AnalyticsDashboard'
import { navIconName } from '@/components/sb/shell/roles'
import { IconTile, PageHeader, Rise, type Tone } from '@/components/sb'

const TONES: Tone[] = ['lav', 'sky', 'saf', 'butter', 'rose', 'stone']

export default function InstitutionDashboardPage() {
  const cards = INSTITUTION_NAV.filter((i) => i.href !== '/dashboard/institution')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Rise><PageHeader kicker="Institution" title="Your" highlight="institution" description="People, academics and insights for your school or institute." /></Rise>

      {/* Real analytics (enrollment, batches, video completion) */}
      <Rise i={1}><AnalyticsDashboard /></Rise>

      <section>
        <h2 style={{ margin: '0 0 14px', fontSize: 22 }}>Quick actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
          {cards.map((card, i) => (
            <Link key={card.href} href={card.href} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 22, background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', color: 'var(--sb-ink)', textDecoration: 'none' }}>
              <IconTile icon={navIconName(card.name) ?? 'sparkle'} tone={TONES[i % TONES.length]} size={48} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 15 }}>{card.name}</span>
                {card.description && <span style={{ display: 'block', fontSize: 12.5, color: 'var(--sb-muted)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.description}</span>}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
