'use client'

/**
 * Learner home (Book Buddy-grade dashboard). A dense grid of rich cards under a greeting with the highlighter:
 * the Gyankosh AI card, today's question allowance, study streak, this week's activity, continue learning,
 * Sanchika, Practest, InkBuddy, the learning-tools drawer and the live notices from teachers.
 *
 * Every figure is real: quota from /api/user/subscription, weekly activity and total questions from
 * /api/user/progress, note count from /api/notes, enrolled batches from tRPC, notices from the live widget.
 * Anything without data shows an inviting empty state. No sample numbers, ever.
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useBetterAuthUser } from '@/hooks/useBetterAuthUser'
import { trpc } from '@/lib/trpc/client'
import { StudentNoticesWidget } from './ClassroomWidgets'
import { Btn, IconTile, PageHeader, Rise, type Tone } from '@/components/sb'
import { AskGyankoshCard, ContinueCard, DashGrid, InkBuddyCard, PractestCard, QuotaCard, SanchikaCard, StreakCard, WeeklyCard } from '@/components/sb/dash'
import { Icon } from '@/components/ui/Icon'

const TOOLS: { icon: string; tone: Tone; name: string; sub: string; href: string }[] = [
  { icon: 'gyankosh', tone: 'lav', name: 'Gyankosh', sub: 'Ask any doubt', href: '/dashboard/user/ai-tutor' },
  { icon: 'inkbuddy', tone: 'sky', name: 'InkBuddy', sub: 'Get handwriting marked', href: '/dashboard/user/inkbuddy' },
  { icon: 'practest', tone: 'butter', name: 'Practest', sub: 'Adaptive tests', href: '/dashboard/user/practest' },
  { icon: 'sanchika', tone: 'saf', name: 'Sanchika', sub: 'Notes and flashcards', href: '/dashboard/user/sanchika' },
  { icon: 'materials', tone: 'stone', name: 'Materials', sub: 'NCERT resources', href: '/dashboard/user/materials' },
  { icon: 'shabdakosh', tone: 'rose', name: 'Shabdakosh', sub: 'English ⇄ हिन्दी', href: '/dashboard/user/dictionary' },
]

function greeting(d: Date) {
  const h = d.getHours()
  return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,'
}

type Week = { day: string; queries: number }[]

export default function UserDashboard() {
  const { user } = useBetterAuthUser()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const now = useMemo(() => new Date(), [])
  const dateLine = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  const [quota, setQuota] = useState<{ remaining?: number; limit?: number; plan?: string } | null>(null)
  const [week, setWeek] = useState<Week>([])
  const [total, setTotal] = useState<number | undefined>()
  const [notes, setNotes] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const batchesQ = trpc.student.getEnrolledBatches.useQuery(undefined, { retry: false })

  useEffect(() => {
    let alive = true
    const j = (url: string) => fetch(url, { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
    Promise.all([j('/api/user/subscription'), j('/api/user/progress'), j('/api/notes')]).then(([sub, prog, nt]) => {
      if (!alive) return
      const q = sub?.quota
      setQuota(q ? { remaining: q.questions_remaining, limit: q.daily_limit, plan: sub?.subscription?.plan_name } : null)
      setWeek(Array.isArray(prog?.weeklyActivity) ? prog.weeklyActivity : [])
      setTotal(typeof prog?.totalQueries === 'number' ? prog.totalQueries : undefined)
      const list = Array.isArray(nt?.notes) ? nt.notes : Array.isArray(nt) ? nt : null
      setNotes(list ? list.length : undefined)
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  const first: any = batchesQ.data?.[0]
  const batch = first ? { id: first.batchId ?? first.batch?.id ?? first.id, name: first.batchName ?? first.batch?.name ?? first.name ?? 'Your batch', subtitle: first.course?.name ?? first.level?.name } : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Rise>
        <PageHeader
          kicker={dateLine}
          title={greeting(now)}
          highlight={firstName}
          description="Ask a doubt, check the page, then write it by hand. Pick up where you left off."
          action={<div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}><Btn kind="primary" href="/dashboard/user/ai-tutor" icon="arrow">Ask Gyankosh</Btn></div>}
        />
      </Rise>

      <DashGrid>
        <AskGyankoshCard index={0} />
        <QuotaCard remaining={quota?.remaining} limit={quota?.limit} plan={quota?.plan} loading={loading} index={1} />
        <StreakCard week={week} loading={loading} index={2} />
        <ContinueCard batch={batch} loading={batchesQ.isLoading} index={3} />
        <WeeklyCard week={week} total={total} loading={loading} index={4} />
        <SanchikaCard notes={notes} loading={loading} index={5} />
        <PractestCard index={6} />
        <InkBuddyCard index={7} />
      </DashGrid>

      {/* learning tools: app-drawer grid */}
      <section>
        <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--sb-font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-.02em' }}>Learning tools</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
          {TOOLS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 + i * 0.05 }} whileTap={{ scale: 0.96 }}>
              <Link href={t.href} className="sb-dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18, borderRadius: 26, background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', boxShadow: 'var(--sb-shadow-card)', color: 'var(--sb-ink)', textDecoration: 'none', minHeight: 150, transition: 'transform .3s, box-shadow .3s' }}>
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
        <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--sb-font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-.02em', display: 'flex', alignItems: 'center', gap: 9 }}>
          <Icon name="notices" size={24} weight="duotone" color="var(--sb-saffron-deep)" />From your teachers
        </h2>
        <StudentNoticesWidget />
      </section>
    </div>
  )
}
