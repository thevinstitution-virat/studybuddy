'use client'

/**
 * Learner home (Redesign Brief §7.1). Greeting with the highlighter, a navy "pick up where you left"
 * hero, tonight's revision, the learning-tools grid (Gyankosh and InkBuddy first) and the live
 * notices from teachers. Data stays real: the name comes from the signed-in user, every tile routes
 * to its real page, and StudentNoticesWidget is the live widget. The old static stat/activity
 * placeholders (streak, course counts, "completed Math Chapter 5"…) are gone rather than restyled —
 * there is no endpoint behind them, and the brief's honesty rule is "no invented figures".
 */

import { useMemo } from 'react'
import { useBetterAuthUser } from '@/hooks/useBetterAuthUser'
import { StudentNoticesWidget } from './ClassroomWidgets'
import { Btn, HeroCard, IconTile, ListRow, PageHeader, RowCard, Rise, type Tone } from '@/components/sb'
import { Icon } from '@/components/ui/Icon'
import Link from 'next/link'
import { motion } from 'framer-motion'

const TOOLS: { icon: string; tone: Tone; name: string; sub: string; href: string }[] = [
  { icon: 'gyankosh', tone: 'lav', name: 'Gyankosh', sub: 'Ask any doubt', href: '/dashboard/user/ai-tutor' },
  { icon: 'inkbuddy', tone: 'sky', name: 'InkBuddy', sub: 'Get handwriting marked', href: '/dashboard/user/inkbuddy' },
  { icon: 'practest', tone: 'butter', name: 'Practest', sub: 'Adaptive tests', href: '/dashboard/user/practest' },
  { icon: 'sanchika', tone: 'saf', name: 'Sanchika', sub: 'Notes and flashcards', href: '/dashboard/user/sanchika' },
  { icon: 'materials', tone: 'stone', name: 'Materials', sub: 'NCERT resources', href: '/dashboard/user/materials' },
  { icon: 'shabdakosh', tone: 'rose', name: 'Shabdakosh', sub: 'English ⇄ हिन्दी', href: '/dashboard/user/dictionary' },
  { icon: 'mitram', tone: 'lav', name: 'Mitram', sub: 'Aptitude insight', href: '/dashboard/user/mitram' },
  { icon: 'productivity', tone: 'butter', name: 'Productivity', sub: 'Plan and focus', href: '/dashboard/user/productivity' },
]

function greeting(d: Date) {
  const h = d.getHours()
  return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,'
}

export default function UserDashboard() {
  const { user } = useBetterAuthUser()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const now = useMemo(() => new Date(), [])
  const dateLine = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Rise>
        <PageHeader kicker={dateLine} title={greeting(now)} highlight={firstName} />
      </Rise>

      {/* two-up: pick up + tonight's revision */}
      <Rise i={1}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 16 }}>
          <HeroCard>
            <div className="sb-kicker" style={{ color: '#FF9933' }}>Pick up where you left</div>
            <h2 style={{ margin: '10px 0 6px', fontFamily: 'var(--sb-font-display)', fontWeight: 700, fontSize: 'clamp(24px,3vw,30px)', lineHeight: 1.1, letterSpacing: '-.03em' }}>Your classroom, batches and lectures</h2>
            <p style={{ margin: 0, color: '#A9AEC6', fontSize: 15, lineHeight: 1.55 }}>Open the lesson you were on, or ask Gyankosh about it first.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
              <Btn kind="accent" href="/dashboard/student" icon="arrow">Resume</Btn>
              <Btn kind="secondary" href="/dashboard/user/ai-tutor" style={{ color: '#fff' }}>Ask Gyankosh</Btn>
            </div>
          </HeroCard>
          <RowCard title="Revise tonight">
            <ListRow icon="flashcards" tone="saf" title="Review flashcards" sub="Saved answers, as cards" href="/dashboard/user/sanchika" />
            <ListRow icon="practest" tone="butter" title="Start a Practest" sub="Questions at your level" href="/dashboard/user/practest" />
            <ListRow icon="scan" tone="sky" title="Scan a handwritten answer" sub="InkBuddy marks it for you" href="/dashboard/user/inkbuddy" />
          </RowCard>
        </div>
      </Rise>

      {/* learning tools: app-drawer grid */}
      <section>
        <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--sb-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-.02em' }}>Learning tools</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
          {TOOLS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 + i * 0.05 }} whileTap={{ scale: 0.96 }}>
              <Link href={t.href} style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, borderRadius: 24, background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', color: 'var(--sb-ink)', textDecoration: 'none', minHeight: 140 }}>
                <IconTile icon={t.icon} tone={t.tone} size={60} />
                <span>
                  <span style={{ display: 'block', fontWeight: 800, fontSize: 16.5 }}>{t.name}</span>
                  <span style={{ display: 'block', fontSize: 13, color: 'var(--sb-muted)', fontWeight: 600, marginTop: 2 }}>{t.sub}</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* live notices from teachers */}
      <section>
        <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--sb-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="notices" size={22} weight="duotone" color="var(--sb-saffron-deep)" />From your teachers
        </h2>
        <StudentNoticesWidget />
      </section>
    </div>
  )
}
