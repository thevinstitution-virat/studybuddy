// src/app/dashboard/parent/page.tsx — parent dashboard landing (Redesign Brief §7.3).
// The tracking tiles are built from the real PARENT_NAV so every tile routes to its real page.
// Ward metrics (attendance %, average score, streak) are intentionally NOT shown: no endpoint backs
// them yet, and the brief says not to invent them. Each tile shows its real page instead.
'use client'

import Link from 'next/link'
import { PARENT_NAV } from '@/lib/dashboard/dashboard-nav'
import { navIconName } from '@/components/sb/shell/roles'
import { HeroCard, IconTile, PageHeader, Rise, type Tone } from '@/components/sb'

const TONES: Tone[] = ['sky', 'lav', 'saf', 'rose', 'butter', 'stone']

export default function ParentDashboardPage() {
  const cards = PARENT_NAV.filter((i) => i.href !== '/dashboard/parent')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Rise><PageHeader kicker="Parent" title="Your child's" highlight="learning" /></Rise>

      <Rise i={1}>
        <HeroCard>
          <div className="sb-kicker" style={{ color: '#FF9933' }}>Tracking</div>
          <h2 style={{ margin: '10px 0 6px', fontSize: 'clamp(24px,3vw,30px)', lineHeight: 1.1, letterSpacing: '-.03em' }}>Progress, reports, attendance and engagement, in one place.</h2>
          <p style={{ margin: 0, color: '#A9AEC6', fontSize: 15, lineHeight: 1.55 }}>Choose a section below to see how your child is doing and to talk to their teachers.</p>
        </HeroCard>
      </Rise>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
        {cards.map((card, i) => (
          <Link key={card.href} href={card.href} style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18, borderRadius: 24, background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', color: 'var(--sb-ink)', textDecoration: 'none' }}>
            <IconTile icon={navIconName(card.name) ?? 'sparkle'} tone={TONES[i % TONES.length]} size={56} />
            <span>
              <span style={{ display: 'block', fontWeight: 800, fontSize: 16.5 }}>{card.name}</span>
              {card.description && <span style={{ display: 'block', fontSize: 13.5, color: 'var(--sb-muted)', fontWeight: 600, marginTop: 3, lineHeight: 1.45 }}>{card.description}</span>}
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}
