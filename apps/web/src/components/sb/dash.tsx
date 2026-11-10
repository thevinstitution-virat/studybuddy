'use client'

/**
 * Dashboard card kit (Book Buddy grade): a dense auto-fill grid of 28px cards that fade up with a 60 ms
 * stagger. One featured card per row: `stage` (navy + glow) or `ai` (cobalt gloss). Every figure shown on a
 * card comes from a real endpoint; when there is none the card shows an inviting empty state, never a sample.
 */

import Link from 'next/link'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Ring } from '@/components/sb'

export function DashGrid({ children }: { children: ReactNode }) {
  return <section style={{ display: 'grid', gridAutoFlow: 'dense', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,290px),1fr))', gap: 18 }}>{children}</section>
}

type Variant = 'default' | 'stage' | 'ai' | 'ink'

const VARIANT: Record<Variant, CSSProperties> = {
  default: { background: 'var(--sb-surface)', color: 'var(--sb-ink)', border: '1px solid var(--sb-line)', boxShadow: 'var(--sb-shadow-card)' },
  stage: { background: 'var(--sb-grad-stage)', color: '#fff', boxShadow: 'var(--sb-shadow-stage)' },
  ai: { background: 'var(--sb-grad-ai)', color: '#fff', boxShadow: 'var(--sb-shadow-gloss-ai), 0 30px 60px -30px rgba(30,58,138,.8)' },
  ink: { background: 'linear-gradient(160deg,#FFF3DE,#FFE3C0)', color: '#0A0F24', border: '1px solid rgba(255,153,51,.35)', boxShadow: 'var(--sb-shadow-card)' },
}

export function DashCard({ children, variant = 'default', wide, index = 0, href, style }: { children: ReactNode; variant?: Variant; wide?: boolean; index?: number; href?: string; style?: CSSProperties }) {
  const base: CSSProperties = {
    position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 28, padding: 22,
    gridColumn: wide ? 'span 2' : undefined, animation: `sbIn .8s ${index * 0.06}s cubic-bezier(.2,.8,.2,1) both`, textDecoration: 'none',
    transition: 'transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s', ...VARIANT[variant], ...style,
  }
  const glow = variant === 'stage' || variant === 'ai'
  const inner = (
    <>
      {glow && <span aria-hidden style={{ position: 'absolute', right: -70, top: -70, width: 260, height: 260, borderRadius: '50%', background: variant === 'ai' ? 'radial-gradient(circle,rgba(255,255,255,.22),transparent 65%)' : 'var(--sb-glow-stage)', pointerEvents: 'none' }} />}
      {glow && <span aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,255,255,.10),transparent 42%)', pointerEvents: 'none' }} />}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>{children}</div>
    </>
  )
  const hover = (e: React.MouseEvent<HTMLElement>, on: boolean) => { e.currentTarget.style.transform = on ? 'translateY(-3px)' : 'none' }
  if (href) return <Link href={href} className="sb-dash-card" style={base} onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>{inner}</Link>
  return <div className="sb-dash-card" style={base} onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>{inner}</div>
}

export function CardHeading({ icon, title, aside, tone = 'ink' }: { icon?: string; title: ReactNode; aside?: ReactNode; tone?: 'ink' | 'light' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 800, fontSize: 16, color: tone === 'light' ? '#fff' : 'inherit' }}>
        {icon && <Icon name={icon} size={20} weight="duotone" />}{title}
      </span>
      {aside}
    </div>
  )
}

export function Pill({ children, tone = 'saf' }: { children: ReactNode; tone?: 'saf' | 'lav' | 'sky' | 'glass' | 'navy' }) {
  const c = { saf: ['var(--sb-saffron-tint)', 'var(--sb-saffron-deep)'], lav: ['var(--sb-lav)', 'var(--sb-lav-ink)'], sky: ['var(--sb-sky)', 'var(--sb-sky-ink)'], glass: ['rgba(255,255,255,.16)', '#fff'], navy: ['#0A0F24', '#FF9933'] }[tone]
  return <span style={{ whiteSpace: 'nowrap', borderRadius: 999, padding: '4px 11px', fontSize: 12, fontWeight: 800, background: c[0], color: c[1] }}>{children}</span>
}

export function useTyped(examples: string[]) {
  const [qi, setQi] = useState(0)
  const [ci, setCi] = useState(0)
  const [reduced, setReduced] = useState(false)
  useEffect(() => setReduced(!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches), [])
  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => {
      setCi((c) => {
        if (c < examples[qi].length + 24) return c + 1
        setQi((q) => (q + 1) % examples.length)
        return 0
      })
    }, 60)
    return () => window.clearInterval(id)
  }, [qi, reduced, examples])
  if (reduced) return { text: examples[0], caret: false }
  const q = examples[qi]
  return { text: q.slice(0, Math.min(ci, q.length)), caret: ci < q.length || ci % 2 === 0 }
}

const EXAMPLES = ['Why does ice float on water?', 'प्रकाश संश्लेषण क्या है?', "Explain Newton's third law with an example", 'What is the SI unit of force?']

/** The AI card: a cobalt Gyankosh entry point with the example questions typing into the pill. */
export function AskGyankoshCard({ index = 0 }: { index?: number }) {
  const { text, caret } = useTyped(EXAMPLES)
  return (
    <DashCard variant="ai" wide index={index} style={{ gap: 18, padding: 26 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 11, fontFamily: 'var(--sb-font-display)', fontWeight: 800, fontSize: 23, letterSpacing: '-.02em' }}>
          <span style={{ width: 40, height: 40, borderRadius: 13, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.16)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4)' }}><Icon name="sparkle" size={22} weight="fill" /></span>
          Ask Gyankosh
        </span>
        <span style={{ fontSize: 13, color: '#DCE8FF' }}>Answers from your textbooks, with the page they came from</span>
      </div>
      <Link href="/dashboard/user/ai-tutor" aria-label="Ask Gyankosh a question" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 58, borderRadius: 999, background: 'rgba(255,255,255,.96)', padding: '0 8px 0 20px', color: '#0A0F24', boxShadow: '0 12px 30px -12px rgba(10,15,36,.6)', textDecoration: 'none' }}>
        <Icon name="search" size={20} color="#5C6178" />
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#4A5470' }}>
          {text}<span aria-hidden style={{ display: 'inline-block', width: 2, height: 18, marginLeft: 2, background: '#3B5BDB', verticalAlign: 'middle', opacity: caret ? 1 : 0 }} />
        </span>
        <span style={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--sb-grad-primary)', boxShadow: 'var(--sb-shadow-gloss)' }}><Icon name="arrow" size={18} weight="bold" color="#0A0F24" /></span>
      </Link>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['Explain this chapter simply', 'Quiz me on a topic', 'Help with my homework'].map((c) => (
          <Link key={c} href="/dashboard/user/ai-tutor" style={{ height: 36, display: 'flex', alignItems: 'center', padding: '0 15px', borderRadius: 999, border: '1px solid rgba(255,255,255,.24)', background: 'rgba(255,255,255,.14)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>{c}</Link>
        ))}
      </div>
    </DashCard>
  )
}

/** Today's question allowance as a ring (from the live subscription quota). */
export function QuotaCard({ remaining, limit, plan, loading, index = 0 }: { remaining?: number; limit?: number; plan?: string; loading?: boolean; index?: number }) {
  const has = typeof limit === 'number' && limit > 0 && typeof remaining === 'number'
  const used = has ? limit! - remaining! : 0
  const pct = has ? Math.max(0, Math.min(100, (remaining! / limit!) * 100)) : 0
  return (
    <DashCard index={index}>
      <CardHeading icon="target" title="Today's questions" aside={plan ? <Pill tone="saf">{plan}</Pill> : undefined} />
      {loading ? <div className="sb-skeleton" style={{ height: 120 }} /> : has ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Ring value={pct} size={110} label={<span style={{ lineHeight: 1 }}>{remaining}<span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--sb-muted)', fontFamily: 'var(--sb-font-ui)' }}>left</span></span>} />
          <div style={{ fontSize: 14, color: 'var(--sb-text-2)', lineHeight: 1.55 }}>
            <b style={{ color: 'var(--sb-ink)' }}>{used} of {limit}</b> asked today.<br />Your allowance resets every day.
          </div>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--sb-text-2)' }}>Start a free trial to get a daily question allowance for Gyankosh.</p>
      )}
      <Link href="/dashboard/user/pricing" style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--sb-saffron-deep)', textDecoration: 'none' }}>See plans →</Link>
    </DashCard>
  )
}

/** Streak: consecutive days with at least one question, from the real 7-day activity. */
export function StreakCard({ week, loading, index = 0 }: { week: { day: string; queries: number }[]; loading?: boolean; index?: number }) {
  let streak = 0
  for (let i = week.length - 1; i >= 0; i--) {
    if (week[i].queries > 0) streak++
    else if (i === week.length - 1) continue // today not studied yet: the streak is still alive until tonight
    else break
  }
  const today = week.length ? week[week.length - 1].queries > 0 : false
  return (
    <DashCard index={index} variant="stage">
      <CardHeading tone="light" icon="fire" title="Study streak" aside={<Pill tone="glass">{today ? 'Done today' : 'Ask one today'}</Pill>} />
      {loading ? <div className="sb-skeleton" style={{ height: 96, opacity: 0.2 }} /> : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--sb-font-display)', fontWeight: 800, fontSize: 64, lineHeight: 0.9, letterSpacing: '-.05em' }} className="sb-gradtext">{streak}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#C9CCDD' }}>{streak === 1 ? 'day' : 'days'} in a row</span>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            {(week.length ? week : Array.from({ length: 7 }, () => ({ day: '', queries: 0 }))).map((d, i) => (
              <span key={i} title={d.day} style={{ flex: 1, height: 10, borderRadius: 6, background: d.queries > 0 ? 'var(--sb-grad-primary)' : 'rgba(255,255,255,.14)', boxShadow: d.queries > 0 ? '0 0 12px rgba(255,153,51,.5)' : 'none' }} />
            ))}
          </div>
        </>
      )}
    </DashCard>
  )
}

/** Questions asked per day over the last week (real tutor usage). */
export function WeeklyCard({ week: weekIn, total, loading, index = 0 }: { week: { day: string; queries: number }[]; total?: number; loading?: boolean; index?: number }) {
  // No data yet (new account or the request failed): draw the seven days of this week as empty bars.
  const empty = weekIn.length === 0
  const week = empty ? Array.from({ length: 7 }, (_, k) => { const d = new Date(); d.setDate(d.getDate() - (6 - k)); return { day: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, queries: 0 } }) : weekIn
  const max = Math.max(1, ...week.map((d) => d.queries))
  const dow = (md: string) => { const [m, d] = md.split('-').map(Number); return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(new Date().getFullYear(), m - 1, d).getDay()] }
  return (
    <DashCard index={index}>
      <CardHeading icon="analytics" title="This week" aside={typeof total === 'number' ? <Pill tone="sky">{total} asked in total</Pill> : undefined} />
      {loading ? <div className="sb-skeleton" style={{ height: 110 }} /> : (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, height: 112 }}>
          {week.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', height: `${Math.max(7, (d.queries / max) * 100)}%`, borderRadius: 9, background: i === week.length - 1 ? 'var(--sb-grad-primary)' : 'linear-gradient(180deg,#7D97FF,#3B5BDB)', opacity: d.queries ? 1 : 0.22, boxShadow: i === week.length - 1 && d.queries ? 'var(--sb-shadow-gloss)' : 'none', transformOrigin: 'bottom', animation: `sbIn .6s ${i * 0.05}s both` }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sb-muted)' }}>{dow(d.day)}</span>
            </div>
          ))}
        </div>
      )}
      {!loading && empty && <div style={{ fontSize: 13.5, color: 'var(--sb-text-2)', lineHeight: 1.5 }}>Ask Gyankosh a question and your week fills in here.</div>}
    </DashCard>
  )
}

/** Continue learning: the first enrolled batch, with its real progress when known. */
export function ContinueCard({ batch, loading, index = 0 }: { batch?: { id: string; name: string; subtitle?: string } | null; loading?: boolean; index?: number }) {
  return (
    <DashCard index={index} variant="stage" href={batch ? `/dashboard/student/batch/${batch.id}` : '/dashboard/student'}>
      <CardHeading tone="light" icon="classroom" title="Continue learning" aside={<Pill tone="glass">Classroom</Pill>} />
      {loading ? <div className="sb-skeleton" style={{ height: 96, opacity: 0.2 }} /> : (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 84, height: 110, borderRadius: 14, background: 'linear-gradient(155deg,#FFC067 0%,#FF9933 45%,#3B5BDB 100%)', boxShadow: '0 18px 30px -14px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.4)', padding: 10, display: 'flex', alignItems: 'flex-end', fontFamily: 'var(--sb-font-display)', fontWeight: 800, fontSize: 14, lineHeight: 1.05, flex: 'none' }}>
            {batch ? batch.name.slice(0, 22) : 'Your first batch'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--sb-font-display)', fontWeight: 700, fontSize: 21, lineHeight: 1.15, letterSpacing: '-.02em' }}>{batch ? batch.name : 'Join a batch'}</div>
            <div style={{ marginTop: 6, fontSize: 13.5, color: '#C9CCDD' }}>{batch ? (batch.subtitle || 'Pick up your next lesson') : 'Enter the join code your teacher gave you.'}</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, height: 40, padding: '0 18px', borderRadius: 999, background: 'var(--sb-grad-primary)', color: '#0A0F24', fontWeight: 800, fontSize: 14, boxShadow: 'var(--sb-shadow-gloss)' }}>{batch ? 'Resume' : 'Join now'}<Icon name="arrow" size={16} weight="bold" /></span>
          </div>
        </div>
      )}
    </DashCard>
  )
}

/** Sanchika: real note count (from /api/notes) and a flashcard entry point. */
export function SanchikaCard({ notes, loading, index = 0 }: { notes?: number; loading?: boolean; index?: number }) {
  return (
    <DashCard index={index} href="/dashboard/user/sanchika">
      <CardHeading icon="sanchika" title="Sanchika" aside={<Pill tone="saf">Notes + cards</Pill>} />
      <div style={{ position: 'relative', height: 96 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ position: 'absolute', left: 8 + i * 22, top: 8 + i * 4, width: 130, height: 80, borderRadius: 14, transform: `rotate(${(i - 1) * 6}deg)`, background: ['var(--sb-lav)', 'var(--sb-butter)', 'var(--sb-grad-primary)'][i], boxShadow: '0 12px 24px -12px rgba(10,15,36,.5), inset 0 1px 0 rgba(255,255,255,.5)', display: 'flex', alignItems: 'flex-end', padding: 10, fontSize: 12, fontWeight: 800, color: i === 2 ? '#0A0F24' : 'var(--sb-ink)' }}>{['Highlights', 'Answers', 'Flashcards'][i]}</span>
        ))}
      </div>
      {loading ? <div className="sb-skeleton" style={{ height: 24 }} /> : (
        <div style={{ fontSize: 14, color: 'var(--sb-text-2)', lineHeight: 1.5 }}>
          {notes ? <><b style={{ color: 'var(--sb-ink)' }}>{notes} {notes === 1 ? 'note' : 'notes'}</b> saved. Turn them into flashcards for tonight.</> : 'Save an answer or a highlight and it becomes a flashcard here.'}
        </div>
      )}
    </DashCard>
  )
}

/** Practest entry. */
export function PractestCard({ index = 0 }: { index?: number }) {
  return (
    <DashCard index={index} href="/dashboard/user/practest" style={{ background: 'linear-gradient(160deg,var(--sb-butter),color-mix(in srgb,var(--sb-butter) 55%,var(--sb-surface)))', border: '1px solid color-mix(in srgb,var(--sb-butter-ink) 18%,transparent)' }}>
      <CardHeading icon="practest" title="Practest" aside={<Pill tone="navy">Adaptive</Pill>} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56 }}>
        {[14, 22, 30, 42, 56].map((h, i) => <span key={i} style={{ width: 16, height: h, borderRadius: 6, background: i === 4 ? 'var(--sb-grad-primary)' : 'color-mix(in srgb,var(--sb-butter-ink) 40%,transparent)', boxShadow: i === 4 ? 'var(--sb-shadow-gloss)' : 'none' }} />)}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--sb-text-2)' }}>Questions that get harder as you get better, with results by chapter.</div>
      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--sb-butter-ink)' }}>Start a test →</span>
    </DashCard>
  )
}

/** InkBuddy entry with a tiny marked notebook. */
export function InkBuddyCard({ index = 0 }: { index?: number }) {
  return (
    <DashCard index={index} href="/dashboard/user/inkbuddy" variant="ink">
      <CardHeading icon="inkbuddy" title="InkBuddy" aside={<Pill tone="navy">Handwriting</Pill>} />
      <div style={{ position: 'relative', borderRadius: 12, padding: '10px 14px 12px 34px', background: '#FFFDF6 linear-gradient(transparent 21px,#1F3A8A1F 21px) 0 8px/100% 22px', boxShadow: '0 14px 26px -16px rgba(10,15,36,.6)', transform: 'rotate(-1.2deg)' }}>
        <span style={{ position: 'absolute', left: 24, top: 0, bottom: 0, width: 1, background: '#FF993399' }} />
        <div style={{ fontFamily: 'var(--sb-font-hand)', fontSize: 15, lineHeight: '22px', color: '#1F3A8A' }}>Ice floats because water expands when it freezes.</div>
        <span style={{ position: 'absolute', left: 6, top: 10, fontFamily: 'var(--sb-font-hand)', fontWeight: 700, color: '#B45309' }}>✓</span>
        <span style={{ position: 'absolute', right: -8, top: -14, width: 48, height: 48, borderRadius: '50%', background: '#0A0F24', color: '#fff', border: '2.5px solid #FF9933', display: 'grid', placeItems: 'center', transform: 'rotate(-10deg)', fontFamily: 'var(--sb-font-display)', fontWeight: 700, fontSize: 15 }}>✓</span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: '#3F4459' }}>Write the answer in your notebook, snap a photo and get it marked like the board exam.</div>
    </DashCard>
  )
}
