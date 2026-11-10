'use client'

/**
 * Study Buddy landing — the marketing page from "Study Buddy Landing" (Redesign Brief §8).
 *
 * Everything reads the --sb-* tokens, so the page follows the day/night toggle. Responsive
 * switches live in styles/sb-landing.css (CSS, not JS) so there is no first-paint flash.
 * Logged-in visitors are still redirected by app/page.tsx exactly as before.
 *
 * Honesty rule (same as Book Buddy): no fake user counts, ratings or testimonials. Only
 * capability facts and "Launching 2026" framing; mock figures live inside product screens.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Icon } from '@/components/ui/Icon'
import { Brand } from '@/components/sb/Brand'
import { ThemeToggle } from '@/components/sb/ThemeToggle'
import { LandingFooter } from '@/components/landing/LandingFooter'

const D = 'var(--sb-font-display)'
const HAND = 'var(--sb-font-hand)'

const kick: CSSProperties = { fontSize: 12.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sb-saffron-deep)' }
const h2: CSSProperties = { margin: '12px 0 0', fontFamily: D, fontWeight: 700, fontSize: 'clamp(34px,5vw,56px)', lineHeight: 1.02, letterSpacing: '-.04em', textWrap: 'balance' as CSSProperties['textWrap'] }
const section: CSSProperties = { maxWidth: 1200, margin: '0 auto', padding: 'clamp(64px,9vw,120px) 20px' }

/* ---------- small building blocks ---------- */

function Chip({ bg, fg, icon, children, style }: { bg: string; fg: string; icon?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 999, background: bg, color: fg, fontSize: 11.5, fontWeight: 700, ...style }}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  )
}

function Tile({ size = 56, bg, fg, icon, weight = 'duotone', radius }: { size?: number; bg: string; fg: string; icon: string; weight?: 'duotone' | 'fill' | 'regular'; radius?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: radius ?? Math.round(size / 3), background: bg, color: fg, display: 'grid', placeItems: 'center', flex: 'none' }}>
      <Icon name={icon} size={Math.round(size * 0.54)} weight={weight} />
    </span>
  )
}

function Highlight({ children, second = false }: { children: ReactNode; second?: boolean }) {
  return <span className={`sb-hi${second ? ' sb-hi-2' : ''}`}>{children}</span>
}

const bubbleUser: CSSProperties = { alignSelf: 'flex-end', background: 'var(--sb-navy)', color: '#F2F3F8', padding: '10px 14px', borderRadius: '18px 18px 5px 18px', fontSize: 13.5, lineHeight: 1.45 }

/* ---------- data ---------- */

const DEMOS = [
  { lang: 'English', q: 'Why does ice float on water?', a: 'Water expands when it freezes. Its molecules form an open hexagonal lattice, so ice is less dense than liquid water.', cite: 'NCERT Science IX · p.132', bloom: 'Understand' },
  { lang: 'हिन्दी', q: 'प्रकाश संश्लेषण क्या है?', a: 'पौधे सूर्य के प्रकाश, जल और कार्बन डाइऑक्साइड से अपना भोजन (ग्लूकोज़) बनाते हैं और ऑक्सीजन छोड़ते हैं।', cite: 'NCERT Science VII · Ch 1', bloom: 'Remember' },
  { lang: 'English', q: 'd/dx (x² sin x)?', a: 'Use the product rule: u′v + uv′. With u = x² and v = sin x, the answer is 2x sin x + x² cos x.', cite: 'NCERT Maths XI · Ch 12', bloom: 'Apply' },
]

type DayStep = { time: string; h: number; m: number; phase: string; icon: string; ti: string; where: string; tool: string; t: string; d: string; light: Tone; dark: Tone }
type Tone = { bg: string; fg: string; sub: string; kick: string }

const DAY: DayStep[] = [
  { time: '06:40', h: 6, m: 40, phase: 'DAWN', icon: 'sun-horizon', ti: 'cards', where: 'School bus', tool: 'Sanchika', t: "Yesterday's doubts are this morning's flashcards.", d: 'Everything she saved last night is waiting as cards. Twelve in ten minutes, and the streak lives on.',
    light: { bg: '#FFE6CC', fg: '#0A0F24', sub: '#5C4630', kick: '#B45309' }, dark: { bg: '#2B1F1A', fg: '#F2F3F8', sub: '#D8C3B0', kick: '#FFB366' } },
  { time: '10:15', h: 10, m: 15, phase: 'MORNING', icon: 'sun', ti: 'sparkle', where: 'Physics class', tool: 'Gyankosh', t: 'A doubt she was too shy to ask out loud.', d: 'She types it under the desk. Virat Gyankosh answers from her NCERT book and shows the chapter.',
    light: { bg: '#F7F6F2', fg: '#0A0F24', sub: '#3F4459', kick: '#B45309' }, dark: { bg: '#0A0F24', fg: '#F2F3F8', sub: '#C9CCDD', kick: '#FFB366' } },
  { time: '13:30', h: 13, m: 30, phase: 'NOON', icon: 'sun', ti: 'exam', where: 'Lunch break', tool: 'Practest', t: 'Three questions before the bell.', d: 'Practest picks questions at her level and gets harder as she gets them right.',
    light: { bg: '#FFF1CF', fg: '#0A0F24', sub: '#5C4A1A', kick: '#B45309' }, dark: { bg: '#241F12', fg: '#F2F3F8', sub: '#D9CFA8', kick: '#FFB366' } },
  { time: '17:00', h: 17, m: 0, phase: 'EVENING', icon: 'sun-horizon', ti: 'pen-nib', where: 'Homework', tool: 'InkBuddy', t: 'She writes the answer by hand, then gets it marked.', d: 'One photo of her notebook. InkBuddy reads the handwriting and marks it like the board exam.',
    light: { bg: '#FF9933', fg: '#0A0F24', sub: '#3A2410', kick: '#0A0F24' }, dark: { bg: '#FF9933', fg: '#0A0F24', sub: '#3A2410', kick: '#0A0F24' } },
  { time: '20:30', h: 20, m: 30, phase: 'NIGHT', icon: 'moon', ti: 'target', where: 'Revision', tool: 'Exam prep', t: 'The app knows what to revise tonight.', d: "Mastery by topic shows the weak spots. Gravitation needs another look, so that's tonight's plan.",
    light: { bg: '#1B2342', fg: '#FFFFFF', sub: '#C9CCDD', kick: '#FF9933' }, dark: { bg: '#1B2342', fg: '#FFFFFF', sub: '#C9CCDD', kick: '#FF9933' } },
  { time: '22:45', h: 22, m: 45, phase: 'LIGHTS OUT', icon: 'moon-stars', ti: 'users-four', where: 'At home', tool: 'ParentPulse', t: 'Her mother sees the day, without asking.', d: 'A short summary for parents: time studied, scores, and what needs work tomorrow.',
    light: { bg: '#0A0F24', fg: '#FFFFFF', sub: '#A9AEC6', kick: '#FF9933' }, dark: { bg: '#070B1A', fg: '#FFFFFF', sub: '#A9AEC6', kick: '#FF9933' } },
]

const AUD = [
  { title: 'Clear a doubt in under a minute, and remember it next week', cta: 'Start free', href: '/sign-up', points: [
    { icon: 'translate', t: 'Ask in Hindi or English', d: 'Type, speak or snap a photo of the question.' },
    { icon: 'book-open-text', t: 'Answers you can check', d: 'Every answer shows the NCERT chapter and page.' },
    { icon: 'exam', t: 'Practice that adapts', d: 'Practest gets harder as you get better.' },
    { icon: 'cards', t: 'Revision that builds itself', d: 'Saved answers turn into flashcards in Sanchika.' } ] },
  { title: 'Know what they studied, not just how long they sat there', cta: 'Start free for your child', href: '/sign-up', points: [
    { icon: 'file-text', t: 'A weekly ParentPulse report', d: 'Time studied, test scores and weak topics, every Sunday.' },
    { icon: 'calendar-check', t: 'Attendance and results in one place', d: 'For every child linked to your account.' },
    { icon: 'chats-circle', t: 'Message teachers directly', d: 'No WhatsApp groups needed.' },
    { icon: 'timer', t: 'Goals and screen-time limits', d: 'Set daily targets and break reminders.' } ] },
  { title: 'One platform for classes, content and safe AI', cta: 'Book a school demo', href: '#contact', points: [
    { icon: 'seal-check', t: 'Teachers approve AI content first', d: 'Nothing reaches students until a teacher signs off.' },
    { icon: 'stack', t: 'Batches, attendance and live classes', d: 'Run every section from one dashboard.' },
    { icon: 'files', t: 'Your materials alongside NCERT', d: 'Upload notes and papers; the tutor cites them too.' },
    { icon: 'chart-bar', t: 'Analytics for every class', d: 'See engagement and completion by batch.' } ] },
]

const FAQ = [
  [
    { q: 'How does the AI tutor actually help me learn?', a: "It answers from your NCERT textbooks, adapts to your pace and explains at the right Bloom's level. It always cites the page, so you can trust the answer." },
    { q: 'Is content aligned to my syllabus?', a: 'Yes. Content is mapped to the latest CBSE and ICSE curriculum for Classes 6–12.' },
    { q: 'What makes Practest special?', a: 'It adjusts difficulty in real time and shows chapter-level results after every attempt.' },
    { q: 'Can I use it offline?', a: 'Yes. Download lessons, practice and notes, and they sync when you reconnect.' },
  ],
  [
    { q: "How do I monitor my child's progress?", a: 'Weekly reports show time studied, scores and trends, with alerts when something needs attention.' },
    { q: 'Is the platform safe for my child?', a: 'Data is encrypted, content is filtered, and the tutor only answers from approved study material.' },
    { q: 'Can I set study schedules and limits?', a: 'Yes. Set daily goals, screen-time limits and break reminders.' },
    { q: "Can I reach my child's teachers?", a: 'Yes, through secure in-app messaging.' },
  ],
  [
    { q: 'How do I manage my classroom?', a: 'Create classes, assign work, mark attendance and track every student from one dashboard.' },
    { q: 'Can I create my own content?', a: 'Yes. Build lessons, quizzes and assignments, or adapt existing content.' },
    { q: 'Who checks the AI-generated questions?', a: 'You do. Content validation lets teachers approve, edit or reject every item before students see it.' },
    { q: 'Is there onboarding support?', a: 'Yes: training, webinars and documentation for your staff.' },
  ],
]

// Plans and limits mirror app/pricing/page.tsx.
const PLANS = [
  { name: 'Free trial', price: '₹0', unit: '/ 7 days', blurb: 'Try every feature.', q: '15', qUnit: 'questions total', feats: ['All boards and classes', 'All subjects', 'No credit card'], cta: 'Start free trial', badge: 'Try free', hot: false },
  { name: 'Basic', price: '₹249', unit: '/ month', blurb: 'For focused learning in one class.', q: '30', qUnit: 'questions / day', feats: ['1 board, 1 class', 'All subjects', 'Email support'], cta: 'Choose Basic', hot: false },
  { name: 'Classic', price: '₹499', unit: '/ month', blurb: 'For dedicated daily learners.', q: '60', qUnit: 'questions / day', feats: ['1 board, 1 class', 'Priority support', 'Advanced analytics'], cta: 'Choose Classic', badge: 'Most popular', hot: true },
  { name: 'Pro', price: '₹999', unit: '/ month', blurb: 'All classes, maximum flexibility.', q: '150', qUnit: 'questions / day', feats: ['1 board, ALL classes 1–12', 'Switch classes anytime', 'Early access to new features'], cta: 'Choose Pro', badge: 'Best value', hot: false },
]

const NAV = [
  { href: '#proof', label: 'Virat Gyankosh' }, { href: '#inkbuddy', label: 'InkBuddy' }, { href: '#day', label: 'A day with Study Buddy' },
  { href: '#features', label: 'Features' }, { href: '#for', label: 'Parents & schools' }, { href: '#pricing', label: 'Pricing' }, { href: '#faq', label: 'FAQ' },
]

const STRIP = [
  { icon: 'seal-check', t: 'CBSE' }, { icon: 'seal-check', t: 'ICSE' }, { icon: 'graduation-cap', t: 'Classes 6–12' }, { icon: 'translate', t: 'हिन्दी + English' },
  { icon: 'book-open-text', t: 'Every answer cites NCERT' }, { icon: 'wifi-slash', t: 'Works offline' }, { icon: 'mobile', t: 'Built for phones' },
]

/* ---------- the page ---------- */

export function StudyBuddyLanding() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [day, setDay] = useState(0)
  const [heroTab, setHeroTab] = useState(0)
  const [picked, setPicked] = useState(false)
  const [demo, setDemo] = useState(0)
  const [aud, setAud] = useState(0)
  const [faqTab, setFaqTab] = useState(0)
  const [open, setOpen] = useState(0)
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pickedRef = useRef(false)
  const heroTabRef = useRef(0)
  pickedRef.current = picked
  heroTabRef.current = heroTab

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 520)
      const els = document.querySelectorAll('[data-day-step]')
      const mid = window.innerHeight * 0.55
      let a = 0
      els.forEach((el, i) => { if (el.getBoundingClientRect().top < mid) a = i })
      setDay((d) => (d === a ? d : a))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    // Hero: without a tap, alternate Gyankosh / InkBuddy every 7s; after a tap, stop switching.
    const t = setInterval(() => {
      if (pickedRef.current) { if (heroTabRef.current === 0) setDemo((d) => (d + 1) % 3); return }
      if (heroTabRef.current === 0) setHeroTab(1)
      else { setHeroTab(0); setDemo((d) => (d + 1) % 3) }
    }, 7000)
    return () => { window.removeEventListener('scroll', onScroll); clearInterval(t) }
  }, [])

  const dark = mounted && resolvedTheme === 'dark'
  const dd = DAY[day]
  const tone = dark ? dd.dark : dd.light
  const onDark = tone.fg === '#FFFFFF' || tone.fg === '#F2F3F8'
  const demoData = DEMOS[demo]
  const A = AUD[aud]

  const goDay = (i: number) => {
    const el = document.querySelectorAll('[data-day-step]')[i]
    if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.3, behavior: 'smooth' })
  }

  return (
    <div className="sbl" id="top">
      {/* ───────── nav ───────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'color-mix(in srgb, var(--sb-paper) 90%, transparent)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid var(--sb-line)' }}>
        <div className="sbl-navrow" style={{ maxWidth: 1200, margin: '0 auto', height: 68, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 24 }}>
          <Brand href="#top" />
          <div className="sbl-desk" style={{ gap: 28, marginLeft: 12, fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap' }}>
            <a className="sbl-link" href="#proof">Gyankosh</a><a className="sbl-link" href="#inkbuddy">InkBuddy</a><a className="sbl-link" href="#features">Features</a>
            <a className="sbl-link" href="#for">Parents &amp; schools</a><a className="sbl-link" href="#pricing">Pricing</a>
          </div>
          <span style={{ flex: 1 }} />
          <ThemeToggle />
          <Link className="sbl-desk sbl-link" href="/sign-in" style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>Sign in</Link>
          <Link className="sbl-btn-primary sbl-nav-cta" href="/sign-up" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 44, padding: '0 18px', borderRadius: 14, fontWeight: 800, fontSize: 14.5, whiteSpace: 'nowrap' }}>
            Start free<Icon name="arrow" size={16} weight="bold" color="var(--sb-saffron)" />
          </Link>
          <span className="sbl-mob">
            <button onClick={() => setMenu((m) => !m)} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu}
              style={{ width: 44, height: 44, borderRadius: 14, border: '1px solid var(--sb-line)', background: 'var(--sb-surface)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Icon name={menu ? 'x' : 'menu'} size={22} />
            </button>
          </span>
        </div>
        {menu && (
          <div className="sbl-mob" style={{ borderTop: '1px solid var(--sb-line)', padding: '10px 20px 20px', flexDirection: 'column', animation: 'sbIn .3s both' }}>
            {NAV.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenu(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px', borderBottom: '1px solid var(--sb-line)', fontFamily: D, fontWeight: 700, fontSize: 22 }}>
                {l.label}<Icon name="arrow-up-right" size={20} color="var(--sb-saffron-deep)" />
              </a>
            ))}
            <Link href="/sign-in" style={{ marginTop: 14, height: 50, borderRadius: 15, border: '1.5px solid var(--sb-ink)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>Sign in</Link>
          </div>
        )}
      </nav>

      <main>
        {/* ───────── hero ───────── */}
        <section style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px,7vw,88px) 20px clamp(48px,7vw,96px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,480px),1fr))', gap: 'clamp(40px,6vw,72px)', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, animation: 'sbIn .6s both' }}>
            <span style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 8px', borderRadius: 999, background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
              <span style={{ padding: '3px 8px', borderRadius: 999, background: '#0A0F24', color: '#FF9933', fontSize: 11.5, fontWeight: 800 }}>2026</span>Founding students onboarding now
            </span>
            <h1 style={{ fontWeight: 700, fontSize: 'clamp(40px,6.4vw,76px)', lineHeight: 1, letterSpacing: '-.045em' }}>
              Learn it with <Highlight>Gyankosh.</Highlight><br />Prove it with <Highlight second>InkBuddy.</Highlight>
            </h1>
            <p style={{ margin: 0, maxWidth: 540, fontSize: 'clamp(17px,1.8vw,19px)', lineHeight: 1.6, color: 'var(--sb-text-2)', textWrap: 'pretty' as CSSProperties['textWrap'] }}>
              <b style={{ color: 'var(--sb-ink)' }}>Virat Gyankosh</b> answers your doubts from your NCERT textbook and shows the page. <b style={{ color: 'var(--sb-ink)' }}>InkBuddy</b> checks the answers you write by hand and gives marks and feedback, like a board examiner. CBSE and ICSE, Classes 6–12.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 10, maxWidth: 560 }}>
              {[{ name: 'Virat Gyankosh', line: 'Ask any doubt. See the page.', icon: 'sparkle', t: ['var(--sb-lav)', 'var(--sb-lav-ink)'] }, { name: 'InkBuddy', line: 'Write by hand. Get marked.', icon: 'pen-nib', t: ['var(--sb-sky)', 'var(--sb-sky-ink)'] }].map((p, i) => {
                const on = i === heroTab
                return (
                  <button key={p.name} className="sbl-press" onClick={() => { setHeroTab(i); setPicked(true) }} aria-pressed={on}
                    style={{ position: 'relative', overflow: 'hidden', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', borderRadius: 20, border: `1.5px solid ${on ? 'var(--sb-navy)' : 'var(--sb-line)'}`, background: on ? 'var(--sb-navy)' : 'var(--sb-surface)', cursor: 'pointer', transition: 'background .3s,border-color .3s,transform .15s' }}>
                    <span style={{ width: 46, height: 46, borderRadius: 15, background: on ? '#FF9933' : p.t[0], color: on ? '#0A0F24' : p.t[1], display: 'grid', placeItems: 'center', flex: 'none', transition: 'all .3s' }}><Icon name={p.icon} size={25} weight="duotone" /></span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: 'block', fontWeight: 800, fontSize: 15.5, color: on ? '#fff' : 'var(--sb-ink)', transition: 'color .3s' }}>{p.name}</span>
                      <span style={{ display: 'block', fontSize: 13, color: on ? '#A9AEC6' : 'var(--sb-muted)', marginTop: 1, transition: 'color .3s' }}>{p.line}</span>
                    </span>
                    <Icon name="arrow" size={16} weight="bold" color={on ? '#FF9933' : 'var(--sb-line)'} />
                    <span style={{ position: 'absolute', left: 0, bottom: 0, height: 3, width: on ? '100%' : '0%', background: '#FF9933', transition: 'width 7s linear' }} />
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link className="sbl-btn-primary" href="/sign-up" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 26px', borderRadius: 18, fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', boxShadow: 'var(--sb-shadow-fab)' }}>
                Start 7-day free trial<Icon name="arrow" size={18} weight="bold" color="var(--sb-saffron)" />
              </Link>
              <a className="sbl-btn-ghost" href="#proof" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 22px', borderRadius: 18, border: '1.5px solid var(--sb-ink)', fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>
                <Icon name="play" size={22} weight="fill" color="var(--sb-saffron-deep)" />See a real answer
              </a>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', fontSize: 13.5, fontWeight: 600, color: 'var(--sb-muted)' }}>
              {['No credit card', '15 free questions', 'Works on any phone'].map((t) => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><Icon name="check" size={16} weight="bold" color="var(--sb-saffron-deep)" />{t}</span>
              ))}
            </div>
          </div>

          {/* phone */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', width: 'min(110%,560px)', aspectRatio: '1', transform: 'translate(-50%,-50%)', borderRadius: '50%', border: '1.5px solid #FF99332E' }} />
            <span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', width: 'min(84%,430px)', aspectRatio: '1', margin: 'calc(min(84%,430px) / -2) 0 0 calc(min(84%,430px) / -2)', borderRadius: '50%', border: '1.5px dashed #FF993366', animation: 'sbSpin 60s linear infinite' }} />
            <div style={{ position: 'relative', width: 320, maxWidth: '100%', height: 640, borderRadius: 44, border: '9px solid var(--sb-frame)', background: 'var(--sb-paper)', overflow: 'hidden', boxShadow: '0 50px 90px -40px #0A0F2488' }}>
              <div style={{ height: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', fontSize: 12.5, fontWeight: 700 }}>
                <span>9:41</span><span style={{ display: 'flex', gap: 5 }}><Icon name="signal" size={14} weight="fill" /><Icon name="wifi-high" size={14} weight="fill" /><Icon name="battery" size={14} weight="fill" /></span>
              </div>
              <div style={{ height: 48, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', borderBottom: '1px solid var(--sb-line)' }}>
                <span style={{ width: 30, height: 30, borderRadius: 10, background: '#0A0F24', color: '#FF9933', display: 'grid', placeItems: 'center' }}><Icon name={heroTab === 0 ? 'sparkle' : 'pen-nib'} size={16} weight="fill" /></span>
                <span style={{ flex: 1, fontFamily: D, fontWeight: 700, fontSize: 16 }}>{heroTab === 0 ? 'Virat Gyankosh' : 'InkBuddy'}</span>
                <span style={{ padding: '4px 9px', borderRadius: 999, background: 'var(--sb-saffron-tint)', color: 'var(--sb-saffron-deep)', fontSize: 11, fontWeight: 800 }}>{heroTab === 0 ? demoData.lang : '3 marks'}</span>
              </div>

              {heroTab === 0 ? (
                <>
                  <div key={'d' + demo} style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ ...bubbleUser, maxWidth: '84%', animation: 'sbPop .35s both', transformOrigin: 'bottom right' }}>{demoData.q}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', animation: 'sbIn .3s .4s both' }}>
                      <span style={{ width: 26, height: 26, borderRadius: 9, background: '#0A0F24', color: '#FF9933', display: 'grid', placeItems: 'center' }}><Icon name="sparkle" size={14} weight="fill" /></span>
                      <span style={{ display: 'flex', gap: 4 }}>{[0, 0.15, 0.3].map((d) => <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sb-ink)', animation: `sbDot 1.1s ${d}s infinite` }} />)}</span>
                      <span style={{ fontSize: 11.5, color: 'var(--sb-muted)' }}>Searching your textbooks…</span>
                    </div>
                    <div style={{ background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', borderRadius: '5px 18px 18px 18px', padding: '12px 13px', fontSize: 13.5, lineHeight: 1.55, animation: 'sbIn .45s 1.5s both' }}>
                      {demoData.a}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                        <Chip bg="var(--sb-lav)" fg="var(--sb-lav-ink)" icon="book-open-text">{demoData.cite}</Chip>
                        <Chip bg="var(--sb-stone)" fg="var(--sb-stone-ink)" icon="stack">{demoData.bloom}</Chip>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, animation: 'sbIn .4s 2s both' }}>
                      <span style={{ padding: '8px 11px', borderRadius: 999, border: '1px solid var(--sb-line)', background: 'var(--sb-surface)', fontSize: 11.5, fontWeight: 700 }}>Explain simpler</span>
                      <span style={{ padding: '8px 11px', borderRadius: 999, background: 'var(--sb-saffron-tint)', color: 'var(--sb-saffron-deep)', fontSize: 11.5, fontWeight: 800 }}>Quiz me</span>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', left: 10, right: 10, bottom: 76, display: 'flex', alignItems: 'center', gap: 4, background: 'var(--sb-surface)', border: '1.5px solid var(--sb-ink)', borderRadius: 24, padding: '4px 4px 4px 14px' }}>
                    <span style={{ flex: 1, color: 'var(--sb-muted)', fontSize: 13 }}>Ask about any chapter…</span>
                    <span style={{ padding: '0 8px', display: 'grid', placeItems: 'center' }}><Icon name="mic" size={19} /></span>
                    <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF9933', color: '#0A0F24', display: 'grid', placeItems: 'center' }}><Icon name="send" size={16} weight="bold" /></span>
                  </div>
                </>
              ) : (
                <div key="ink" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, animation: 'sbIn .4s both' }}>
                  <div style={{ background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', borderRadius: 16, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.06em', color: 'var(--sb-muted)' }}>SCIENCE IX · CH 10 · 3 MARKS</div>
                    <div style={{ fontWeight: 800, fontSize: 14, marginTop: 3 }}>Why does ice float on water?</div>
                  </div>
                  <div className="sbl-notebook" style={{ position: 'relative', overflow: 'hidden', transform: 'rotate(-1.2deg)', backgroundImage: 'linear-gradient(#1F3A8A1A 1px,transparent 1px)', backgroundSize: '100% 24px', backgroundPosition: '0 6px', borderRadius: 6, padding: '8px 12px 10px 30px', boxShadow: '0 10px 22px -16px #0A0F24' }}>
                    <span style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 1, background: '#FF993399' }} />
                    <div style={{ fontFamily: HAND, fontSize: 15, lineHeight: '24px' }}>Ice floats because when water freezes it expands, so its density decreases. Ice is lighter than water.</div>
                    <span style={{ position: 'absolute', left: 4, top: 8, fontFamily: HAND, fontWeight: 700, fontSize: 15, color: '#B45309', animation: 'sbPop .3s 1.6s both' }}>✓</span>
                    <span style={{ position: 'absolute', left: 4, top: 32, fontFamily: HAND, fontWeight: 700, fontSize: 15, color: '#B45309', animation: 'sbPop .3s 1.9s both' }}>✓</span>
                    <span style={{ position: 'absolute', left: 0, right: 0, height: 2, background: '#FF9933', boxShadow: '0 0 12px 3px #FF993388', animation: 'sbScan 1.4s .2s ease-in-out both' }} />
                  </div>
                  <div style={{ background: 'var(--sb-navy)', color: '#fff', borderRadius: 18, padding: '12px 13px', display: 'flex', flexDirection: 'column', gap: 8, animation: 'sbIn .4s 1.7s both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', color: '#FF9933' }}>INKBUDDY MARKS</span>
                      <span style={{ fontFamily: D, fontWeight: 700, fontSize: 24 }}>2.5<span style={{ fontSize: 14, color: '#A9AEC6' }}> / 3</span></span>
                    </div>
                    {['Water expands on freezing', 'Density decreases'].map((t) => (
                      <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5 }}><Icon name="check" size={14} weight="bold" color="#FF9933" />{t}</span>
                    ))}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#FFB4AE' }}><Icon name="minus" size={14} weight="bold" />Why? Open hexagonal lattice (−0.5)</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, animation: 'sbIn .4s 2.1s both' }}>
                    <Chip bg="var(--sb-lav)" fg="var(--sb-lav-ink)" icon="book-open-text" style={{ padding: '6px 10px' }}>Revise p.132</Chip>
                    <Chip bg="var(--sb-saffron-tint)" fg="var(--sb-saffron-deep)" style={{ padding: '6px 10px', fontWeight: 800 }}>Try again</Chip>
                  </div>
                </div>
              )}

              {/* Android bottom bar */}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#0A0F24', borderRadius: '22px 22px 0 0', padding: '7px 4px 16px', display: 'flex' }}>
                {[['home', 'Home'], ['learn', 'Learn'], ['tutor', 'Tutor'], ['progress', 'Progress'], ['more', 'More']].map(([ic, lb]) => {
                  const on = lb === 'Tutor'
                  return (
                    <span key={lb} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: on ? '#fff' : '#9AA0BC' }}>
                      <span style={{ width: 48, height: 28, borderRadius: 14, background: on ? '#FF9933' : 'transparent', color: on ? '#0A0F24' : 'inherit', display: 'grid', placeItems: 'center' }}><Icon name={ic} size={20} active={on} /></span>
                      <span style={{ fontSize: 10, fontWeight: 700 }}>{lb}</span>
                    </span>
                  )
                })}
              </div>
            </div>
            <div className="sbl-desk-block">
              <div style={{ position: 'absolute', left: 0, top: '18%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px 10px 10px', borderRadius: 18, background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', boxShadow: 'var(--sb-shadow-float)', animation: 'sbFloat 5s ease-in-out infinite' }}>
                <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--sb-saffron-tint)', color: 'var(--sb-saffron-deep)', display: 'grid', placeItems: 'center' }}><Icon name="fire" size={22} weight="fill" /></span>
                <span><span style={{ display: 'block', fontWeight: 800, fontSize: 16 }}>12 days</span><span style={{ fontSize: 12, color: 'var(--sb-muted)' }}>study streak</span></span>
              </div>
              <div style={{ position: 'absolute', right: 0, bottom: '20%', display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 16px', borderRadius: 20, background: 'var(--sb-navy)', color: '#fff', boxShadow: '0 20px 40px -20px #0A0F24AA', animation: 'sbFloat 6s 1s ease-in-out infinite' }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: '#FF9933', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>PRACTEST · PHYSICS</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontFamily: D, fontWeight: 700, fontSize: 30 }}>4/5</span><span style={{ fontSize: 12.5, color: '#A9AEC6' }}>+1 level</span></span>
                <span style={{ display: 'flex', gap: 4 }}>{[1, 1, 1, 1, 0].map((on, i) => <span key={i} style={{ width: 22, height: 6, borderRadius: 6, background: on ? '#FF9933' : '#FFFFFF33' }} />)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── trust strip ───────── */}
        <div style={{ borderTop: '1px solid var(--sb-line)', borderBottom: '1px solid var(--sb-line)', background: 'var(--sb-surface)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', width: 'max-content', animation: 'sbMarq 40s linear infinite' }}>
            {[...STRIP, ...STRIP].map((s, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 28px', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>
                <Icon name={s.icon} size={22} weight="duotone" color="var(--sb-saffron-deep)" />{s.t}
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sb-line)', marginLeft: 28 }} />
              </span>
            ))}
          </div>
        </div>

        {/* ───────── a day with Study Buddy ───────── */}
        <section id="day" className="sbl-day-bg" style={{ position: 'relative', background: tone.bg, color: tone.fg }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(64px,9vw,120px) 20px 0' }}>
            <div style={{ ...kick, color: tone.kick, transition: 'color .8s' }}>A day with Study Buddy</div>
            <h2 style={{ ...h2, maxWidth: 820, fontSize: 'clamp(34px,5.4vw,60px)', lineHeight: 1 }}>One student. One syllabus. Every hour of her day.</h2>
            <p style={{ margin: '16px 0 0', maxWidth: 560, fontSize: 17, lineHeight: 1.6, color: tone.sub, transition: 'color .8s' }}>Follow Ananya, Class IX, CBSE, from the school bus to lights-out. Scroll, and watch the day move.</p>
          </div>
          <div className="sbl-day-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(28px,4vw,48px) 20px clamp(64px,9vw,120px)', display: 'grid', gap: 'clamp(24px,5vw,64px)', alignItems: 'start' }}>
            {/* desktop: the fixed clock (column stretches the full section; child is sticky) */}
            <div className="sbl-desk-block" style={{ alignSelf: 'stretch', height: '100%' }}>
              <div style={{ position: 'sticky', top: 76, height: 'calc(100vh - 76px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                <div style={{ position: 'relative', width: 'min(100%,340px,50vh)', aspectRatio: '1', borderRadius: '50%', background: 'var(--sb-surface)', boxShadow: '0 40px 80px -40px #0A0F2488, inset 0 0 0 10px var(--sb-frame)' }}>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const big = i % 3 === 0
                    return <span key={i} style={{ position: 'absolute', left: '50%', top: '50%', width: big ? 6 : 3, height: big ? 18 : 10, marginLeft: big ? -3 : -1.5, background: big ? 'var(--sb-ink)' : 'var(--sb-line)', borderRadius: 3, transform: `rotate(${i * 30}deg) translateY(calc((min(170px,25vh) - 26px) * -1))`, transformOrigin: '50% 0' }} />
                  })}
                  <div style={{ position: 'absolute', left: '50%', top: '30%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'var(--sb-ink)' }}>
                    <Icon name={dd.icon} size={30} weight="duotone" color="var(--sb-saffron-deep)" />
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: 'var(--sb-muted)' }}>{dd.phase}</span>
                  </div>
                  <div style={{ position: 'absolute', inset: 0, transform: `rotate(${(dd.h % 12) * 30 + dd.m * 0.5}deg)`, transition: 'transform 1s cubic-bezier(.3,1.3,.5,1)' }}><span style={{ position: 'absolute', left: '50%', bottom: '50%', width: 8, height: '26%', marginLeft: -4, borderRadius: 8, background: 'var(--sb-ink)' }} /></div>
                  <div style={{ position: 'absolute', inset: 0, transform: `rotate(${dd.m * 6}deg)`, transition: 'transform 1s cubic-bezier(.3,1.3,.5,1)' }}><span style={{ position: 'absolute', left: '50%', bottom: '50%', width: 5, height: '38%', marginLeft: -2.5, borderRadius: 5, background: '#FF9933' }} /></div>
                  <span style={{ position: 'absolute', left: '50%', top: '50%', width: 18, height: 18, margin: '-9px 0 0 -9px', borderRadius: '50%', background: 'var(--sb-ink)', border: '4px solid #FF9933' }} />
                </div>
                <div key={'t' + day} style={{ fontFamily: D, fontWeight: 700, fontSize: 64, letterSpacing: '-.04em', lineHeight: 1, animation: 'sbPop .45s both' }}>{dd.time}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {DAY.map((x, i) => (
                    <button key={x.time} onClick={() => goDay(i)} aria-label={`Go to ${x.time}`}
                      style={{ width: i === day ? 28 : 10, height: 10, borderRadius: 10, border: 'none', padding: 0, background: i === day ? '#FF9933' : onDark ? '#FFFFFF44' : '#0A0F2433', cursor: 'pointer', transition: 'all .4s cubic-bezier(.3,1.3,.5,1)' }} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* phone: sticky time pill instead of the clock */}
              <div className="sbl-mob" style={{ position: 'sticky', top: 76, zIndex: 5, alignSelf: 'flex-start', alignItems: 'center', gap: 10, padding: '8px 16px 8px 8px', borderRadius: 999, background: '#0A0F24', color: '#fff', boxShadow: '0 14px 30px -16px #0A0F24AA', marginBottom: 8 }}>
                <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF9933', color: '#0A0F24', display: 'grid', placeItems: 'center' }}><Icon name={dd.icon} size={20} weight="fill" /></span>
                <span key={'m' + day} style={{ fontFamily: D, fontWeight: 700, fontSize: 22, animation: 'sbPop .4s both' }}>{dd.time}</span>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', color: '#A9AEC6' }}>{dd.phase}</span>
              </div>
              {DAY.map((s, i) => {
                const on = i === day
                const chipBg = onDark ? '#FFFFFF1A' : tone.bg === '#FF9933' ? '#0A0F24' : 'var(--sb-surface)'
                const chipFg = onDark ? '#fff' : tone.bg === '#FF9933' ? '#FF9933' : 'var(--sb-ink)'
                return (
                  <div key={s.time} data-day-step className="sbl-step" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, padding: '28px 0', opacity: on ? 1 : 0.35, transform: on ? 'none' : 'translateY(12px)', transition: 'opacity .6s, transform .6s cubic-bezier(.2,.8,.2,1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: D, fontWeight: 700, fontSize: 20 }}>{s.time}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: chipBg, color: chipFg, fontSize: 12.5, fontWeight: 800, whiteSpace: 'nowrap', transition: 'all .8s' }}>
                        <Icon name={s.ti} size={16} weight="duotone" />{s.where} · {s.tool}
                      </span>
                    </div>
                    <h3 style={{ maxWidth: 520, fontWeight: 700, fontSize: 'clamp(26px,3.2vw,36px)', lineHeight: 1.08, letterSpacing: '-.03em' }}>{s.t}</h3>
                    <p style={{ margin: 0, maxWidth: 500, fontSize: 16, lineHeight: 1.6, color: tone.sub, transition: 'color .8s' }}>{s.d}</p>
                    <div style={{ maxWidth: 440, width: '100%' }}><DayCard i={i} /></div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ───────── why it's different ───────── */}
        <section id="proof" style={{ ...section, display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div style={{ maxWidth: 760 }}>
            <div style={kick}>Why it&apos;s different</div>
            <h2 style={h2}>Most AI tutors guess. Study Buddy shows you the page.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 16 }}>
            <div style={{ background: 'var(--sb-stone)', borderRadius: 30, padding: 'clamp(22px,3.5vw,34px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Tile size={42} bg="var(--sb-surface)" fg="var(--sb-muted)" icon="robot" weight="regular" /><span style={{ fontWeight: 800, fontSize: 16, color: 'var(--sb-text-2)' }}>A general chatbot</span></div>
              <div style={{ alignSelf: 'flex-end', background: 'var(--sb-surface)', padding: '11px 15px', borderRadius: '18px 18px 5px 18px', fontSize: 15, fontWeight: 600 }}>Why does ice float on water?</div>
              <div style={{ background: 'var(--sb-surface)', borderRadius: '5px 18px 18px 18px', padding: '14px 16px', fontSize: 15, lineHeight: 1.6, color: 'var(--sb-text-2)' }}>Ice floats because it&apos;s lighter than water. This is due to many factors including temperature, air bubbles and molecular structure…</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                {['No source to check', "Mixes in claims that aren't in your syllabus", "Wording won't match the board exam"].map((t) => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--sb-danger-ink)' }}><Icon name="x" size={16} weight="bold" />{t}</span>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--sb-navy)', color: '#F2F3F8', borderRadius: 30, padding: 'clamp(22px,3.5vw,34px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <span aria-hidden style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', border: '1.5px dashed #FF993355', animation: 'sbSpin 50s linear infinite' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Tile size={42} bg="#FF9933" fg="#0A0F24" icon="sparkle" weight="fill" /><span style={{ fontWeight: 800, fontSize: 16 }}>Study Buddy</span></div>
              <div style={{ alignSelf: 'flex-end', background: '#FFFFFF1A', padding: '11px 15px', borderRadius: '18px 18px 5px 18px', fontSize: 15, fontWeight: 600 }}>Why does ice float on water?</div>
              <div style={{ background: '#fff', color: '#0A0F24', borderRadius: '5px 18px 18px 18px', padding: '14px 16px', fontSize: 15, lineHeight: 1.6 }}>
                Water expands when it freezes. Its molecules lock into an open hexagonal lattice, so ice is <b style={{ background: 'linear-gradient(#FFD199,#FFD199) no-repeat 0 85%', backgroundSize: '100% 45%' }}>less dense</b> than liquid water.
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  <Chip bg="#E8E5FB" fg="#4636B0" icon="book-open-text" style={{ padding: '5px 10px', fontSize: 12 }}>NCERT Science IX · Ch 10, p.132</Chip>
                  <Chip bg="#EDECE6" fg="#3F4459" icon="stack" style={{ padding: '5px 10px', fontSize: 12 }}>Bloom: Understand</Chip>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                {['Exact chapter and page, so you can open the book and check', "Only what's in your board's syllabus", 'Says "not in your books" instead of guessing'].map((t) => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}><Icon name="check" size={16} weight="bold" color="#FF9933" />{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───────── InkBuddy deep dive ───────── */}
        <section id="inkbuddy" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px clamp(64px,9vw,120px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 'clamp(36px,6vw,72px)', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <span style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 8px', borderRadius: 999, background: 'var(--sb-sky)', color: 'var(--sb-sky-ink)', fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap' }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--sb-surface)', display: 'grid', placeItems: 'center' }}><Icon name="pen-nib" size={16} weight="duotone" /></span>InkBuddy · Virat Evaluator
              </span>
              <h2 style={{ ...h2, margin: 0 }}>Write it by hand. Get it marked like the board exam.</h2>
              <p style={{ margin: 0, maxWidth: 520, fontSize: 17, lineHeight: 1.6, color: 'var(--sb-text-2)' }}>Board exams are written on paper, so practise on paper. Pick a question from your textbook, answer it in your notebook and take a photo. InkBuddy reads your handwriting, marks it against the textbook and shows where you lost marks.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { n: '01', icon: 'search', t: 'Pick a textbook question', d: 'Search your book by chapter or topic.' },
                  { n: '02', icon: 'camera', t: 'Write and snap', d: 'Use your own notebook, in Hindi or English medium.' },
                  { n: '03', icon: 'seal-check', t: 'Get marks and feedback', d: 'Marks for each point, what was missing, and the page to revise.', navy: true },
                ].map((r) => (
                  <div key={r.n} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px', borderRadius: 20, background: r.navy ? 'var(--sb-navy)' : 'var(--sb-surface)', border: r.navy ? 'none' : '1px solid var(--sb-line)', color: r.navy ? '#fff' : 'inherit' }}>
                    <span style={{ fontFamily: D, fontWeight: 700, fontSize: 22, color: r.navy ? '#FF9933' : 'var(--sb-saffron-deep)', width: 30 }}>{r.n}</span>
                    <Icon name={r.icon} size={26} weight="duotone" color={r.navy ? '#FF9933' : 'var(--sb-sky-ink)'} />
                    <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: 'block', fontWeight: 800, fontSize: 15.5 }}>{r.t}</span><span style={{ display: 'block', fontSize: 13.5, color: r.navy ? '#A9AEC6' : 'var(--sb-muted)' }}>{r.d}</span></span>
                  </div>
                ))}
              </div>
              <Link className="sbl-btn-primary" href="/sign-up" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 10, height: 54, padding: '0 24px', borderRadius: 17, fontWeight: 800, fontSize: 15.5, whiteSpace: 'nowrap' }}>
                Try InkBuddy free<Icon name="arrow" size={18} weight="bold" color="var(--sb-saffron)" />
              </Link>
            </div>
            <div style={{ position: 'relative', padding: '20px clamp(8px,3vw,30px)' }}>
              <div className="sbl-notebook" style={{ position: 'relative', transform: 'rotate(-1.5deg)', backgroundImage: 'linear-gradient(transparent 33px,#1F3A8A1F 33px)', backgroundSize: '100% 34px', backgroundPosition: '0 26px', borderRadius: 8, padding: '26px 24px 64px 88px', boxShadow: '0 30px 60px -34px #0A0F2488' }}>
                <span style={{ position: 'absolute', left: 72, top: 0, bottom: 0, width: 1.5, background: '#FF9933AA' }} />
                {[{ l: 16, t: 20 }, { l: 16, t: '50%' }, { l: 16, b: 20 }].map((p, i) => <span key={i} style={{ position: 'absolute', left: p.l, top: p.t, bottom: p.b, width: 12, height: 12, borderRadius: '50%', background: '#E3E1D9' }} />)}
                <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 21, lineHeight: '34px', color: '#0A0F24' }}>Q3. Why does ice float on water? <span style={{ fontWeight: 400, color: '#5C6178' }}>(3)</span></div>
                <div style={{ fontFamily: HAND, fontSize: 20, lineHeight: '34px' }}>
                  <div style={{ position: 'relative' }}>When water freezes, it expands.<Mark>✓ +1</Mark></div>
                  <div style={{ position: 'relative' }}>Its volume increases, so the <span style={{ borderBottom: '2.5px solid #FF9933' }}>density decreases</span>.<Mark>✓ +1</Mark></div>
                  <div style={{ position: 'relative' }}>Ice is less dense than water, so it floats on top.<Mark>✓ +½</Mark></div>
                  <div style={{ color: '#B45309', fontWeight: 700, fontSize: 18, lineHeight: '34px' }}>↳ Why does it expand? Mention the open hexagonal structure. (p.132)</div>
                </div>
                <div style={{ position: 'absolute', right: -8, top: -22, width: 112, height: 112, borderRadius: '50%', background: '#0A0F24', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '4px solid #FF9933', boxShadow: '0 18px 30px -14px #0A0F24AA', animation: 'sbStamp .7s .3s cubic-bezier(.3,1.4,.5,1) both' }}>
                  <span style={{ fontFamily: D, fontWeight: 700, fontSize: 34, lineHeight: 1 }}>2½</span><span style={{ fontSize: 12, fontWeight: 800, color: '#FF9933' }}>out of 3</span>
                </div>
              </div>
              <div style={{ position: 'relative', margin: '-26px 0 0 auto', width: 'min(100%,300px)', background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', borderRadius: 20, padding: '14px 16px', boxShadow: 'var(--sb-shadow-float)', display: 'flex', gap: 12, alignItems: 'flex-start', animation: 'sbFloat 6s ease-in-out infinite' }}>
                <Tile size={38} bg="#0A0F24" fg="#FF9933" icon="sparkle" weight="fill" radius={12} />
                <span style={{ fontSize: 13.5, lineHeight: 1.5 }}><b>Next step:</b> ask Gyankosh why water expands, then try this question again.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── how it works ───────── */}
        <section id="how" style={{ background: 'var(--sb-surface)', borderTop: '1px solid var(--sb-line)', borderBottom: '1px solid var(--sb-line)' }}>
          <div style={{ ...section, display: 'flex', flexDirection: 'column', gap: 40 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
              <div><div style={kick}>How it works</div><h2 style={h2}>From doubt to mastery<br />in three steps</h2></div>
              <p style={{ margin: 0, maxWidth: 360, color: 'var(--sb-muted)', fontSize: 16, lineHeight: 1.6 }}>One loop, every day. Fifteen minutes is enough to keep a streak going.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 16 }}>
              {[
                { n: '01', icon: 'chat-circle-text', t: 'Ask', d: 'Type, speak or photograph a doubt from any chapter, in Hindi or English.', navy: false, tile: ['var(--sb-lav)', 'var(--sb-lav-ink)'] },
                { n: '02', icon: 'book-open-text', t: 'Check the page', d: 'The answer comes with the exact textbook page. Open it, read it, trust it.', navy: true, tile: ['#FF9933', '#0A0F24'] },
                { n: '03', icon: 'target', t: 'Practise', d: 'Practest and flashcards drill what you just learned until it sticks.', navy: false, tile: ['var(--sb-saffron-tint)', 'var(--sb-saffron-deep)'] },
              ].map((s) => (
                <div key={s.n} style={{ position: 'relative', overflow: 'hidden', background: s.navy ? 'var(--sb-navy)' : 'var(--sb-paper)', color: s.navy ? '#fff' : 'var(--sb-ink)', border: s.navy ? 'none' : '1px solid var(--sb-line)', borderRadius: 28, padding: 26, display: 'flex', flexDirection: 'column', gap: 40, minHeight: 300 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Tile size={58} bg={s.tile[0]} fg={s.tile[1]} icon={s.icon} radius={20} />
                    <span style={{ fontFamily: D, fontWeight: 700, fontSize: 72, lineHeight: 0.8, letterSpacing: '-.05em', color: s.navy ? '#FFFFFF1F' : 'var(--sb-line)' }}>{s.n}</span>
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-.02em' }}>{s.t}</h3>
                    <p style={{ margin: '10px 0 0', fontSize: 15.5, lineHeight: 1.6, color: s.navy ? '#A9AEC6' : 'var(--sb-text-2)' }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── features bento ───────── */}
        <section id="features" style={{ ...section, display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div style={{ maxWidth: 760 }}><div style={kick}>Everything in one app</div><h2 style={h2}>Ask, practise, revise. Then do it again tomorrow.</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 16 }}>
            <div style={{ background: 'var(--sb-lav)', borderRadius: 30, padding: 26, display: 'flex', flexDirection: 'column', gap: 18, gridRow: 'span 2' }}>
              <Tile size={56} bg="var(--sb-surface)" fg="var(--sb-lav-ink)" icon="sparkle" radius={19} />
              <div><h3 style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-.02em' }}>Virat Gyankosh</h3><p style={{ margin: '8px 0 0', fontSize: 15.5, lineHeight: 1.6, color: 'var(--sb-text-2)' }}>Your AI teacher. Switch between Doubt, Explain, Exam prep and Homework modes. Every answer cites the page.</p></div>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ alignSelf: 'flex-end', background: 'var(--sb-lav-ink)', color: 'var(--sb-paper)', padding: '10px 14px', borderRadius: '16px 16px 4px 16px', fontSize: 14, fontWeight: 600 }}>d/dx (x² sin x)?</span>
                <span style={{ background: 'var(--sb-surface)', padding: '12px 14px', borderRadius: '4px 16px 16px 16px', fontSize: 14, lineHeight: 1.55 }}>Product rule: <b>2x sin x + x² cos x</b><br /><Chip bg="var(--sb-lav)" fg="var(--sb-lav-ink)" icon="book-open-text" style={{ marginTop: 8 }}>NCERT Maths XI · Ch 12</Chip></span>
              </div>
            </div>
            <div style={{ background: 'var(--sb-butter)', borderRadius: 30, padding: 26, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Tile size={56} bg="var(--sb-surface)" fg="var(--sb-butter-ink)" icon="exam" radius={19} />
                <span style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 40 }}>{[[14, '55'], [20, '55'], [26, '88'], [34, '']].map(([h, a], i) => <span key={i} style={{ width: 10, height: h as number, borderRadius: 4, background: a ? `color-mix(in srgb, var(--sb-butter-ink) ${a === '88' ? 53 : 33}%, transparent)` : '#FF9933' }} />)}</span>
              </div>
              <div><h3 style={{ fontWeight: 700, fontSize: 26, letterSpacing: '-.02em' }}>Practest</h3><p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.6, color: 'var(--sb-text-2)' }}>Adaptive tests that get harder as you improve, with chapter-level results after every attempt.</p></div>
            </div>
            <div style={{ background: 'var(--sb-saf)', borderRadius: 30, padding: 26, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Tile size={56} bg="var(--sb-surface)" fg="var(--sb-saf-ink)" icon="cards" radius={19} />
                <span style={{ position: 'relative', width: 60, height: 44 }}><span style={{ position: 'absolute', inset: '4px 0 0 10px', borderRadius: 9, background: '#FF993355', transform: 'rotate(10deg)' }} /><span style={{ position: 'absolute', inset: '0 10px 4px 0', borderRadius: 9, background: '#FF9933' }} /></span>
              </div>
              <div><h3 style={{ fontWeight: 700, fontSize: 26, letterSpacing: '-.02em' }}>Sanchika</h3><p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.6, color: 'var(--sb-text-2)' }}>Your study archive. Highlights and saved answers become flashcards for tonight&apos;s revision.</p></div>
            </div>
            <div style={{ background: 'var(--sb-sky)', borderRadius: 30, padding: 26, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Tile size={56} bg="var(--sb-surface)" fg="var(--sb-sky-ink)" icon="pen-nib" radius={19} />
              <div><h3 style={{ fontWeight: 700, fontSize: 26, letterSpacing: '-.02em' }}>InkBuddy</h3><p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.6, color: 'var(--sb-text-2)' }}>Write the answer by hand, snap a photo, get it checked. Practice for the real paper.</p></div>
            </div>
            <div style={{ background: 'var(--sb-rose)', borderRadius: 30, padding: 26, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tile size={56} bg="var(--sb-surface)" fg="var(--sb-rose-ink)" icon="translate" radius={19} />
                <span style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontWeight: 700, fontSize: 28, color: 'var(--sb-rose-ink)' }}>शब्द</span>
              </div>
              <div><h3 style={{ fontWeight: 700, fontSize: 26, letterSpacing: '-.02em' }}>Shabdakosh</h3><p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.6, color: 'var(--sb-text-2)' }}>English–Hindi dictionary with pronunciation, examples and synonyms.</p></div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[{ icon: 'magnifying-glass-plus', t: 'Sarvagya', d: 'research assistant' }, { icon: 'brain', t: 'Mitram', d: 'aptitude & focus checks' }, { icon: 'shield', t: 'FocusShield', d: 'blocks distractions' }, { icon: 'wifi-slash', t: 'OfflineOrbit', d: 'study without internet' }, { icon: 'certificate', t: 'Certificates', d: 'for every course' }].map((x) => (
              <span key={x.t} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 16px', borderRadius: 999, background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', fontWeight: 700, fontSize: 14 }}>
                <Icon name={x.icon} size={20} weight="duotone" color="var(--sb-saffron-deep)" />{x.t}<span style={{ color: 'var(--sb-muted)', fontWeight: 600 }}>· {x.d}</span>
              </span>
            ))}
          </div>
        </section>

        {/* ───────── for the whole house ───────── */}
        <section id="for" style={{ background: 'var(--sb-navy)', color: '#F2F3F8' }}>
          <div style={{ ...section, display: 'flex', flexDirection: 'column', gap: 36 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 22 }}>
              <div><div style={{ ...kick, color: '#FF9933' }}>Made for the whole house</div><h2 style={h2}>One app. Three views.</h2></div>
              <div role="tablist" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', padding: 5, borderRadius: 999, background: '#FFFFFF14', width: 'min(100%,420px)' }}>
                <span aria-hidden style={{ position: 'absolute', top: 5, bottom: 5, left: 5, width: 'calc((100% - 10px) / 3)', borderRadius: 999, background: '#FF9933', transform: `translateX(${aud * 100}%)`, transition: 'transform .45s cubic-bezier(.3,1.3,.5,1)' }} />
                {['Students', 'Parents', 'Schools'].map((l, i) => (
                  <button key={l} role="tab" aria-selected={i === aud} onClick={() => setAud(i)} style={{ position: 'relative', zIndex: 1, border: 'none', background: 'none', padding: '12px 6px', fontWeight: 800, fontSize: 14.5, color: i === aud ? '#0A0F24' : '#C9CCDD', cursor: 'pointer', transition: 'color .3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Icon name={['student', 'users-four', 'buildings'][i]} size={18} active={i === aud} />{l}
                  </button>
                ))}
              </div>
            </div>
            <div key={'a' + aud} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 'clamp(24px,4vw,48px)', alignItems: 'center', animation: 'sbIn .45s both' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <h3 style={{ fontWeight: 700, fontSize: 'clamp(28px,3.6vw,40px)', lineHeight: 1.08, letterSpacing: '-.03em' }}>{A.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {A.points.map((p) => (
                    <div key={p.t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <Tile size={40} bg="#FFFFFF12" fg="#FF9933" icon={p.icon} radius={13} />
                      <span style={{ flex: 1, minWidth: 0, paddingTop: 2 }}><span style={{ display: 'block', fontWeight: 800, fontSize: 16 }}>{p.t}</span><span style={{ display: 'block', fontSize: 14.5, color: '#A9AEC6', marginTop: 2, lineHeight: 1.5 }}>{p.d}</span></span>
                    </div>
                  ))}
                </div>
                <Link className="sbl-btn-saffron" href={A.href} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 10, height: 54, padding: '0 24px', borderRadius: 17, fontWeight: 800, fontSize: 15.5 }}>{A.cta}<Icon name="arrow" size={18} weight="bold" /></Link>
              </div>
              <div style={{ background: 'var(--sb-paper)', color: 'var(--sb-ink)', borderRadius: 30, padding: 'clamp(18px,3vw,26px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <AudMock i={aud} />
              </div>
            </div>
          </div>
        </section>

        {/* ───────── pricing ───────── */}
        <section id="pricing" style={{ ...section, display: 'flex', flexDirection: 'column', gap: 36 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
            <div><div style={kick}>Pricing</div><h2 style={h2}>Less than one tuition class a month</h2></div>
            <p style={{ margin: 0, maxWidth: 340, color: 'var(--sb-muted)', fontSize: 15.5, lineHeight: 1.6 }}>Every plan includes the citation-backed tutor and all subjects for your class.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,250px),1fr))', gap: 14, alignItems: 'stretch' }}>
            {PLANS.map((p) => {
              const hot = p.hot
              const mute = hot ? '#A9AEC6' : 'var(--sb-muted)'
              return (
                <div key={p.name} style={{ position: 'relative', background: hot ? 'var(--sb-navy)' : 'var(--sb-surface)', color: hot ? '#fff' : 'var(--sb-ink)', border: hot ? '2px solid var(--sb-navy)' : '1px solid var(--sb-line)', borderRadius: 28, padding: 24, display: 'flex', flexDirection: 'column', gap: 18, outline: hot ? '1px solid var(--sb-line)' : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: 18 }}>{p.name}</span>
                    {p.badge && <span style={{ padding: '5px 11px', borderRadius: 999, background: hot ? '#FF9933' : 'var(--sb-saffron-tint)', color: hot ? '#0A0F24' : 'var(--sb-saffron-deep)', fontSize: 12, fontWeight: 800 }}>{p.badge}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontFamily: D, fontWeight: 700, fontSize: 48, letterSpacing: '-.04em', lineHeight: 1 }}>{p.price}</span><span style={{ fontSize: 14, fontWeight: 600, color: mute }}>{p.unit}</span></div>
                    <div style={{ fontSize: 14, color: mute, marginTop: 8 }}>{p.blurb}</div>
                  </div>
                  <div style={{ padding: '12px 14px', borderRadius: 16, background: hot ? '#FFFFFF14' : 'var(--sb-paper)', display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontFamily: D, fontWeight: 700, fontSize: 26 }}>{p.q}</span><span style={{ fontSize: 13, fontWeight: 600, color: mute }}>{p.qUnit}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {p.feats.map((f) => <span key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 14, lineHeight: 1.45 }}><Icon name="check" size={16} weight="bold" color={hot ? '#FF9933' : 'var(--sb-saffron-deep)'} className="mt-0.5" />{f}</span>)}
                  </div>
                  <Link href="/sign-up" className={hot ? 'sbl-btn-saffron' : 'sbl-btn-ghost'} style={{ marginTop: 'auto', height: 50, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 800, fontSize: 15, border: hot ? 'none' : '1.5px solid var(--sb-ink)' }}>{p.cta}<Icon name="arrow" size={16} weight="bold" /></Link>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: 'var(--sb-muted)' }}>
            {[['shield-check', '7-day money-back on paid plans'], ['credit-card', 'No-cost EMI available'], ['x-circle', 'Cancel anytime']].map(([ic, t]) => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon name={ic} size={20} weight="duotone" color="var(--sb-saffron-deep)" />{t}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18, padding: '22px 24px', borderRadius: 26, border: '2px dashed var(--sb-line)' }}>
            <Tile size={52} bg="var(--sb-sky)" fg="var(--sb-sky-ink)" icon="buildings" radius={17} />
            <div style={{ flex: 1, minWidth: 220 }}><div style={{ fontWeight: 800, fontSize: 17 }}>For schools and coaching institutes</div><div style={{ fontSize: 14.5, color: 'var(--sb-muted)', marginTop: 3 }}>Seats for every student, teacher dashboards, your own content and live classes.</div></div>
            <a className="sbl-btn-ghost" href="#contact" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 48, padding: '0 20px', borderRadius: 15, border: '1.5px solid var(--sb-ink)', fontWeight: 800 }}>Book a school demo<Icon name="arrow" size={16} weight="bold" /></a>
          </div>
        </section>

        {/* ───────── FAQ ───────── */}
        <section id="faq" style={{ background: 'var(--sb-surface)', borderTop: '1px solid var(--sb-line)' }}>
          <div style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(64px,9vw,120px) 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ textAlign: 'center' }}><div style={kick}>FAQ</div><h2 style={{ ...h2, fontSize: 'clamp(34px,5vw,52px)' }}>Questions, answered</h2></div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              {['Students', 'Parents', 'Teachers'].map((l, i) => (
                <button key={l} onClick={() => { setFaqTab(i); setOpen(0) }} aria-pressed={i === faqTab} style={{ height: 42, padding: '0 18px', borderRadius: 999, border: `1.5px solid ${i === faqTab ? 'var(--sb-navy)' : 'var(--sb-line)'}`, background: i === faqTab ? 'var(--sb-navy)' : 'var(--sb-surface)', color: i === faqTab ? '#fff' : 'var(--sb-ink)', fontWeight: 700, fontSize: 14.5, cursor: 'pointer', transition: 'all .2s' }}>{l}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FAQ[faqTab].map((f, i) => {
                const o = i === open
                return (
                  <div key={f.q} style={{ borderRadius: 22, background: o ? 'var(--sb-paper)' : 'var(--sb-surface)', border: '1px solid var(--sb-line)', overflow: 'hidden', transition: 'background .25s' }}>
                    <button onClick={() => setOpen(o ? -1 : i)} aria-expanded={o} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontWeight: 800, fontSize: 16.5 }}>
                      <span style={{ flex: 1 }}>{f.q}</span>
                      <span style={{ width: 34, height: 34, borderRadius: '50%', background: o ? '#FF9933' : 'var(--sb-surface-2)', color: o ? '#0A0F24' : 'var(--sb-ink)', display: 'grid', placeItems: 'center', flex: 'none', transform: `rotate(${o ? 45 : 0}deg)`, transition: 'transform .35s cubic-bezier(.3,1.4,.5,1), background .2s' }}><Icon name="add" size={16} weight="bold" /></span>
                    </button>
                    {o && <div style={{ padding: '0 20px 20px', fontSize: 15.5, lineHeight: 1.65, color: 'var(--sb-text-2)', animation: 'sbIn .3s both' }}>{f.a}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ───────── final CTA ───────── */}
        <section style={{ padding: '0 20px clamp(48px,6vw,80px)', background: 'var(--sb-surface)' }}>
          <div style={{ position: 'relative', overflow: 'hidden', maxWidth: 1200, margin: '0 auto', background: 'var(--sb-navy)', color: '#fff', borderRadius: 'clamp(28px,4vw,44px)', padding: 'clamp(36px,6vw,72px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 22 }}>
            <span aria-hidden style={{ position: 'absolute', right: -120, bottom: -120, width: 420, height: 420, borderRadius: '50%', border: '1.5px solid #FF99332E' }} />
            <span aria-hidden style={{ position: 'absolute', right: -50, bottom: -50, width: 280, height: 280, borderRadius: '50%', border: '1.5px dashed #FF993366', animation: 'sbSpin 50s linear infinite' }} />
            <span aria-hidden style={{ position: 'absolute', right: 110, bottom: 110, width: 32, height: 32, borderRadius: '50%', background: '#FF9933', animation: 'sbFloat 3s ease-in-out infinite' }} />
            <h2 style={{ position: 'relative', maxWidth: 720, fontWeight: 700, fontSize: 'clamp(36px,5.6vw,64px)', lineHeight: 1, letterSpacing: '-.045em' }}>Your next doubt deserves <span style={{ color: '#FF9933' }}>a real answer.</span></h2>
            <p style={{ position: 'relative', margin: 0, maxWidth: 480, color: '#A9AEC6', fontSize: 17, lineHeight: 1.6 }}>Start with 15 free questions. Pick a plan only if it helps.</p>
            <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link className="sbl-btn-saffron" href="/sign-up" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 26px', borderRadius: 18, fontWeight: 800, fontSize: 16 }}>Start 7-day free trial<Icon name="arrow" size={18} weight="bold" /></Link>
              <a href="#contact" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 22px', borderRadius: 18, border: '1.5px solid #FFFFFF40', color: '#fff', fontWeight: 700, fontSize: 16 }}><Icon name="buildings" size={20} />For schools</a>
            </div>
          </div>
        </section>
      </main>

      {/* The app's existing footer, kept (per request) with the Study Buddy name, plus the new design's Buddy-family cards and the day/night toggle. */}
      <LandingFooter />

      {/* phone only: sticky start-free bar, springs up once the visitor has scrolled past the hero */}
      <div className="sbl-bar" style={{ position: 'fixed', left: 12, right: 12, bottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 40, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px 8px 16px', borderRadius: 20, background: '#0A0F24', color: '#fff', boxShadow: '0 18px 36px -16px #0A0F24CC', transform: `translateY(${scrolled ? '0' : '140%'})` }}>
        <span style={{ flex: 1, fontSize: 13.5, lineHeight: 1.3 }}><b>15 free questions</b><br /><span style={{ color: '#A9AEC6' }}>No credit card</span></span>
        <Link href="/sign-up" style={{ height: 46, padding: '0 18px', borderRadius: 14, background: '#FF9933', color: '#0A0F24', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 14.5 }}>Start free<Icon name="arrow" size={16} weight="bold" /></Link>
      </div>
    </div>
  )
}

/* ---------- pieces that need their own scope ---------- */

function Mark({ children }: { children: ReactNode }) {
  return <span style={{ position: 'absolute', left: -80, top: 0, width: 60, whiteSpace: 'nowrap', fontWeight: 700, color: '#B45309' }}>{children}</span>
}

const card: CSSProperties = { background: 'var(--sb-surface)', borderRadius: 22, boxShadow: '0 24px 50px -30px #0A0F2466', color: 'var(--sb-ink)' }

function DayCard({ i }: { i: number }) {
  if (i === 0) return (
    <div style={{ ...card, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: 'var(--sb-muted)' }}><span>SANCHIKA · CARD 3 OF 12</span><span style={{ color: 'var(--sb-saffron-deep)' }}>QUESTION</span></div>
      <div style={{ fontFamily: D, fontWeight: 700, fontSize: 22, lineHeight: 1.2 }}>Why does ice float on water?</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <Chip bg="var(--sb-saffron-tint)" fg="var(--sb-saffron-deep)" style={{ padding: '6px 11px', fontSize: 12, fontWeight: 800 }}>12 due</Chip>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 999, background: '#0A0F24', color: '#fff', fontSize: 12, fontWeight: 800 }}><Icon name="fire" size={14} weight="fill" color="#FF9933" />12-day streak</span>
      </div>
    </div>
  )
  if (i === 1) return (
    <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ alignSelf: 'flex-end', background: 'var(--sb-navy)', color: '#fff', padding: '10px 14px', borderRadius: '16px 16px 4px 16px', fontSize: 14, fontWeight: 600 }}>What&apos;s the difference between speed and velocity?</span>
      <span style={{ background: 'var(--sb-paper)', padding: '12px 14px', borderRadius: '4px 16px 16px 16px', fontSize: 14, lineHeight: 1.55 }}>Speed is how fast. Velocity is how fast <b>and in which direction</b>, so it can be negative.<br /><Chip bg="var(--sb-lav)" fg="var(--sb-lav-ink)" icon="book-open-text" style={{ marginTop: 8 }}>NCERT Science IX · Ch 8</Chip></span>
    </div>
  )
  if (i === 2) return (
    <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ display: 'flex', gap: 5 }}>{['var(--sb-navy)', '#FF9933', 'var(--sb-heat-0)'].map((c, k) => <span key={k} style={{ flex: 1, height: 6, borderRadius: 6, background: c }} />)}</div>
      <div style={{ fontWeight: 800, fontSize: 15.5, margin: '4px 0 2px' }}>The SI unit of force is:</div>
      <span style={{ padding: '10px 12px', borderRadius: 13, border: '1.5px solid var(--sb-line)', fontSize: 14, fontWeight: 600, color: 'var(--sb-muted)' }}>Joule</span>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 13, background: 'var(--sb-navy)', color: '#fff', fontSize: 14, fontWeight: 700 }}>Newton<Icon name="check-circle" size={18} weight="fill" color="#FF9933" /></span>
      <span style={{ padding: '10px 12px', borderRadius: 13, border: '1.5px solid var(--sb-line)', fontSize: 14, fontWeight: 600, color: 'var(--sb-muted)' }}>Watt</span>
    </div>
  )
  if (i === 3) return (
    <div className="sbl-notebook" style={{ position: 'relative', backgroundImage: 'linear-gradient(transparent 29px,#1F3A8A1F 29px)', backgroundSize: '100% 30px', backgroundPosition: '0 14px', borderRadius: 10, padding: '14px 72px 18px 52px', boxShadow: '0 24px 50px -30px #0A0F2466', transform: 'rotate(-1deg)' }}>
      <span style={{ position: 'absolute', left: 40, top: 0, bottom: 0, width: 1.5, background: '#FF9933AA' }} />
      <div style={{ fontFamily: HAND, fontSize: 17, lineHeight: '30px' }}>Newton&apos;s 3rd law: every action has an equal and opposite reaction. Example: a rocket pushes gas down, gas pushes it up.</div>
      <span style={{ position: 'absolute', left: 12, top: 14, fontFamily: HAND, fontWeight: 700, color: '#B45309', lineHeight: '30px' }}>✓</span>
      <span style={{ position: 'absolute', left: 12, top: 44, fontFamily: HAND, fontWeight: 700, color: '#B45309', lineHeight: '30px' }}>✓</span>
      <span style={{ position: 'absolute', right: -10, top: -18, width: 76, height: 76, borderRadius: '50%', background: '#0A0F24', color: '#fff', border: '3px solid #FF9933', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-10deg)' }}><span style={{ fontFamily: D, fontWeight: 700, fontSize: 24, lineHeight: 1 }}>3</span><span style={{ fontSize: 10, fontWeight: 800, color: '#FF9933' }}>out of 3</span></span>
    </div>
  )
  if (i === 4) return (
    <div style={{ ...card, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 11 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 800, fontSize: 15 }}>Exam prep · Physics</span><span style={{ fontSize: 12, fontWeight: 800, color: 'var(--sb-saffron-deep)' }}>3 weak topics</span></div>
      {[['Motion', 86], ['Force', 74], ['Gravitation', 52]].map(([n, v]) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 96, fontSize: 13, fontWeight: 700 }}>{n}</span>
          <span style={{ flex: 1, height: 8, borderRadius: 8, background: 'var(--sb-heat-0)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${v}%`, background: (v as number) < 60 ? '#FF9933' : 'var(--sb-ink)' }} /></span>
          <span style={{ fontSize: 13, fontWeight: 800 }}>{v}</span>
        </div>
      ))}
    </div>
  )
  return (
    <div style={{ ...card, background: 'color-mix(in srgb, var(--sb-surface) 95%, transparent)', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <Tile size={40} bg="#0A0F24" fg="#FF9933" icon="sparkle" weight="fill" radius={12} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: 'var(--sb-muted)' }}><span>PARENTPULSE</span><span>22:45</span></span>
        <span style={{ display: 'block', fontWeight: 800, fontSize: 14.5, marginTop: 3 }}>Ananya&apos;s day</span>
        <span style={{ display: 'block', fontSize: 13.5, lineHeight: 1.5, color: 'var(--sb-text-2)', marginTop: 2 }}>Studied 1h 52m · Practest 4/5 · InkBuddy 3/3. Gravitation needs revision.</span>
      </span>
    </div>
  )
}

function Stat({ v, l }: { v: string; l: string }) {
  return <div style={{ background: 'var(--sb-surface)', borderRadius: 16, padding: 12 }}><div style={{ fontFamily: D, fontWeight: 700, fontSize: 24 }}>{v}</div><div style={{ fontSize: 12, color: 'var(--sb-muted)', fontWeight: 600 }}>{l}</div></div>
}

function Bar({ n, v, hot }: { n: string; v: number; hot?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 70, fontSize: 13, fontWeight: 700 }}>{n}</span>
      <span style={{ flex: 1, height: 8, borderRadius: 8, background: 'var(--sb-heat-0)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${v}%`, background: hot ? '#FF9933' : 'var(--sb-ink)', borderRadius: 8 }} /></span>
      <span style={{ fontSize: 13, fontWeight: 800 }}>{v}</span>
    </div>
  )
}

function AudMock({ i }: { i: number }) {
  if (i === 0) {
    const rows = [
      { time: '07:30', t: 'Flashcards', s: '12 due in Sanchika', icon: 'cards', bg: 'var(--sb-lav)', fg: 'var(--sb-lav-ink)' },
      { time: '11:00', t: 'Practest · Chemistry', s: '3 adaptive questions', icon: 'exam', bg: 'var(--sb-butter)', fg: 'var(--sb-butter-ink)' },
      { time: '16:00', t: 'Live class · Maths', s: 'Integration by parts', icon: 'video-camera', bg: 'var(--sb-sky)', fg: 'var(--sb-sky-ink)' },
    ]
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: D, fontWeight: 700, fontSize: 20 }}>Your day</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 999, background: 'var(--sb-saffron-tint)', color: 'var(--sb-saffron-deep)', fontWeight: 800, fontSize: 13 }}><Icon name="fire" size={15} weight="fill" />12</span>
        </div>
        {rows.map((r) => (
          <div key={r.time} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, background: r.bg }}>
            <span style={{ fontFamily: D, fontWeight: 700, fontSize: 18, color: r.fg, width: 54 }}>{r.time}</span>
            <span style={{ flex: 1 }}><span style={{ display: 'block', fontWeight: 800, fontSize: 14.5 }}>{r.t}</span><span style={{ display: 'block', fontSize: 12.5, color: 'var(--sb-text-2)' }}>{r.s}</span></span>
            <Icon name={r.icon} size={24} weight="duotone" color={r.fg} />
          </div>
        ))}
      </>
    )
  }
  if (i === 1) return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontFamily: D, fontWeight: 700, fontSize: 20 }}>Aarav&apos;s week</span><span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--sb-muted)' }}>ParentPulse · Sun</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}><Stat v="5h 40m" l="studied" /><Stat v="96%" l="attendance" /><Stat v="78" l="avg score" /></div>
      <div style={{ background: 'var(--sb-surface)', borderRadius: 18, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>Strong this week</div>
        <Bar n="Maths" v={84} /><Bar n="Science" v={76} /><Bar n="Hindi" v={58} hot />
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', borderRadius: 16, background: 'var(--sb-lav)' }}>
        <Icon name="chats-circle" size={22} weight="duotone" color="var(--sb-lav-ink)" /><span style={{ fontSize: 13.5, lineHeight: 1.4 }}><b>Ms. Rao:</b> Aarav&apos;s essay improved a lot this week.</span>
      </div>
    </>
  )
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontFamily: D, fontWeight: 700, fontSize: 20 }}>Content validation</span><Chip bg="var(--sb-butter)" fg="var(--sb-butter-ink)" style={{ padding: '5px 10px', fontSize: 12, fontWeight: 800 }}>18 to review</Chip></div>
      <div style={{ background: 'var(--sb-surface)', borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 14px 30px -24px #0A0F24' }}>
        <div style={{ display: 'flex', gap: 6 }}><Chip bg="#0A0F24" fg="#FF9933" style={{ fontWeight: 800, fontSize: 11 }}>MCQ</Chip><Chip bg="var(--sb-lav)" fg="var(--sb-lav-ink)" style={{ fontSize: 11 }}>AI-generated</Chip></div>
        <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.35 }}>Which mode of heat transfer needs no medium?</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 12, background: 'var(--sb-saffron-tint)', fontWeight: 700, fontSize: 14 }}><Icon name="check-circle" size={18} weight="fill" color="var(--sb-saffron-deep)" />Radiation</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
          <span style={{ height: 42, borderRadius: 13, border: '1.5px solid var(--sb-danger)', color: 'var(--sb-danger-ink)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14 }}>Reject</span>
          <span style={{ height: 42, borderRadius: 13, background: 'var(--sb-primary)', color: 'var(--sb-primary-fg)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14 }}>Approve</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}><Stat v="1,248" l="students" /><Stat v="22" l="batches" /><Stat v="71%" l="completion" /></div>
    </>
  )
}

export default StudyBuddyLanding
