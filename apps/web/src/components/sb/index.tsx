'use client'

/**
 * Shared Study Buddy components (Redesign Brief §6). Cards are flat (1px line, no shadow); shadows
 * belong only to floating layers. Everything reads --sb-* tokens, so it follows day/night.
 * Pages import icons by semantic name via <Icon>, never a glyph.
 */

import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'

export type Tone = 'lav' | 'sky' | 'saf' | 'butter' | 'rose' | 'stone'
const TONE: Record<Tone, { bg: string; ink: string }> = {
  lav: { bg: 'var(--sb-lav)', ink: 'var(--sb-lav-ink)' },
  sky: { bg: 'var(--sb-sky)', ink: 'var(--sb-sky-ink)' },
  saf: { bg: 'var(--sb-saf)', ink: 'var(--sb-saf-ink)' },
  butter: { bg: 'var(--sb-butter)', ink: 'var(--sb-butter-ink)' },
  rose: { bg: 'var(--sb-rose)', ink: 'var(--sb-rose-ink)' },
  stone: { bg: 'var(--sb-stone)', ink: 'var(--sb-stone-ink)' },
}
/** Subject mapping is fixed everywhere (brief §2). */
export const SUBJECT_TONE: Record<string, Tone> = { physics: 'lav', chemistry: 'butter', maths: 'sky', mathematics: 'sky', biology: 'rose', english: 'saf', hindi: 'stone' }
export const toneFor = (subject?: string): Tone => SUBJECT_TONE[(subject || '').toLowerCase()] ?? 'stone'

const DISPLAY = 'var(--sb-font-display)'

/* ── Card ── */
export function Card({ children, style, className, onClick, href }: { children: ReactNode; style?: CSSProperties; className?: string; onClick?: () => void; href?: string }) {
  const base: CSSProperties = { background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', borderRadius: 24, padding: 20, color: 'var(--sb-ink)', ...style }
  if (href) return <motion.div whileTap={{ scale: 0.97 }}><Link href={href} className={className} style={{ display: 'block', textDecoration: 'none', ...base }}>{children}</Link></motion.div>
  return <motion.div whileTap={onClick ? { scale: 0.97 } : undefined} onClick={onClick} className={className} style={{ ...base, cursor: onClick ? 'pointer' : undefined }}>{children}</motion.div>
}

/* ── HeroCard (navy) ── */
export function HeroCard({ children, style, orbit = true }: { children: ReactNode; style?: CSSProperties; orbit?: boolean }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--sb-navy)', color: '#fff', borderRadius: 28, padding: 'clamp(20px,3vw,28px)', border: '1px solid var(--sb-line)', ...style }}>
      {orbit && <span aria-hidden style={{ position: 'absolute', right: -70, top: -70, width: 220, height: 220, borderRadius: '50%', border: '1.5px dashed #FF993355', animation: 'sbSpin 50s linear infinite' }} />}
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  )
}

/* ── IconTile (pastel + duotone) ── */
export function IconTile({ icon, tone = 'stone', size = 48, active = false }: { icon: string; tone?: Tone; size?: number; active?: boolean }) {
  const t = TONE[tone]
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: [0.6, 1.06, 1], opacity: 1 }} transition={{ duration: 0.45 }}
      style={{ width: size, height: size, borderRadius: Math.round(size / 3.2), background: t.bg, color: t.ink, display: 'grid', placeItems: 'center', flex: 'none' }}
    >
      <Icon name={icon} size={Math.round(size * 0.52)} weight={active ? 'fill' : 'duotone'} />
    </motion.span>
  )
}

/* ── Chip / FilterChip ── */
export function Chip({ children, tone = 'stone', icon, style }: { children: ReactNode; tone?: Tone | 'navy' | 'danger'; icon?: string; style?: CSSProperties }) {
  const c = tone === 'navy' ? { bg: 'var(--sb-navy)', ink: '#fff' } : tone === 'danger' ? { bg: 'var(--sb-danger-tint)', ink: 'var(--sb-danger-ink)' } : TONE[tone]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 999, background: c.bg, color: c.ink, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', ...style }}>
      {icon && <Icon name={icon} size={14} />}{children}
    </span>
  )
}

export function FilterChip({ children, on, onClick }: { children: ReactNode; on?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} style={{ height: 40, padding: '0 16px', borderRadius: 999, border: `1.5px solid ${on ? 'var(--sb-navy)' : 'var(--sb-line)'}`, background: on ? 'var(--sb-navy)' : 'var(--sb-surface)', color: on ? '#fff' : 'var(--sb-ink)', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .2s' }}>
      {children}
    </button>
  )
}

/* ── SegmentedControl: sliding navy indicator ── */
export function SegmentedControl({ options, value, onChange, label }: { options: { id: string; label: string; icon?: string }[]; value: string; onChange: (id: string) => void; label?: string }) {
  const i = Math.max(0, options.findIndex((o) => o.id === value))
  return (
    <div role="tablist" aria-label={label} style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${options.length},1fr)`, padding: 5, borderRadius: 999, background: 'var(--sb-surface-2)', width: '100%', maxWidth: 440 }}>
      <motion.span aria-hidden animate={{ x: `${i * 100}%` }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ position: 'absolute', top: 5, bottom: 5, left: 5, width: `calc((100% - 10px) / ${options.length})`, borderRadius: 999, background: 'var(--sb-navy)' }} />
      {options.map((o) => {
        const on = o.id === value
        return (
          <button key={o.id} role="tab" aria-selected={on} type="button" onClick={() => onChange(o.id)} style={{ position: 'relative', zIndex: 1, border: 'none', background: 'none', height: 42, fontWeight: 800, fontSize: 14, color: on ? '#fff' : 'var(--sb-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'color .25s' }}>
            {o.icon && <Icon name={o.icon} size={18} active={on} />}{o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── ListRow ── */
export function ListRow({ icon, tone = 'stone', title, sub, trailing, href, onClick, chevron }: { icon?: string; tone?: Tone; title: ReactNode; sub?: ReactNode; trailing?: ReactNode; href?: string; onClick?: () => void; chevron?: boolean }) {
  const inner = (
    <>
      {icon && <IconTile icon={icon} tone={tone} size={44} />}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 800, fontSize: 15.5, lineHeight: 1.25 }}>{title}</span>
        {sub && <span style={{ display: 'block', fontSize: 13, color: 'var(--sb-muted)', marginTop: 2, fontWeight: 600 }}>{sub}</span>}
      </span>
      {trailing}
      {(chevron ?? !!href) && <Icon name="caret-right" size={18} color="var(--sb-muted)" />}
    </>
  )
  const style: CSSProperties = { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', color: 'var(--sb-ink)', textDecoration: 'none', borderBottom: '1px solid var(--sb-line)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: href || onClick ? 'pointer' : 'default' }
  if (href) return <Link href={href} style={{ ...style, borderBottom: '1px solid var(--sb-line)' }} className="sb-row">{inner}</Link>
  return <div onClick={onClick} style={{ ...style, borderBottom: '1px solid var(--sb-line)' }} className="sb-row">{inner}</div>
}

/** A white card of ListRows (rows are square inside the card; the last has no divider). */
export function RowCard({ children, title, action }: { children: ReactNode; title?: ReactNode; action?: ReactNode }) {
  return (
    <section style={{ background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', borderRadius: 24, overflow: 'hidden' }} className="sb-rowcard">
      {(title || action) && (
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 10px' }}>
          <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, letterSpacing: '-.02em' }}>{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

/* ── StatTile / KpiTile ── */
export function StatTile({ value, label, icon, tone = 'stone', delta }: { value: ReactNode; label: string; icon?: string; tone?: Tone; delta?: string }) {
  return (
    <div style={{ background: 'var(--sb-surface)', border: '1px solid var(--sb-line)', borderRadius: 24, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {icon && <IconTile icon={icon} tone={tone} size={40} />}
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, lineHeight: 1, letterSpacing: '-.03em' }}>{value}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--sb-muted)' }}>
        <span>{label}</span>{delta && <span style={{ color: 'var(--sb-saffron-deep)', fontWeight: 800 }}>{delta}</span>}
      </div>
    </div>
  )
}

/* ── BarChart (CSS bars). Ink on light cards, saffron on navy; today saffron, others ink at 25%. ── */
export function BarChart({ data, onNavy = false, height = 110 }: { data: { label: string; value: number; today?: boolean }[]; onNavy?: boolean; height?: number }) {
  const reduce = useReducedMotion()
  const max = Math.max(1, ...data.map((d) => d.value))
  const base = onNavy ? '#FF9933' : 'var(--sb-ink)'
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }} role="img" aria-label="Bar chart">
      {data.map((d, i) => (
        <div key={d.label + i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <motion.div
            initial={reduce ? false : { scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 22, delay: i * 0.05 }}
            style={{ width: '100%', height: `${Math.max(6, (d.value / max) * 100)}%`, borderRadius: 8, transformOrigin: 'bottom', background: d.today ? '#FF9933' : base, opacity: d.today ? 1 : 0.25 }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: onNavy ? '#A9AEC6' : 'var(--sb-muted)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Ring (conic progress) ── */
export function Ring({ value, size = 96, label, onNavy = false }: { value: number; size?: number; label?: ReactNode; onNavy?: boolean }) {
  const [v, setV] = useState(0)
  useEffect(() => { const t = setTimeout(() => setV(value), 60); return () => clearTimeout(t) }, [value])
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: '50%', background: `conic-gradient(#FF9933 ${v * 3.6}deg, ${onNavy ? '#FFFFFF22' : 'var(--sb-heat-0)'} 0)`, transition: 'background .9s', display: 'grid', placeItems: 'center' }}>
      <div style={{ width: size - 18, height: size - 18, borderRadius: '50%', background: onNavy ? 'var(--sb-navy)' : 'var(--sb-surface)', display: 'grid', placeItems: 'center', textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: size / 4, color: onNavy ? '#fff' : 'var(--sb-ink)' }}>
        {label ?? `${Math.round(value)}%`}
      </div>
    </div>
  )
}

/* ── PageHeader: kicker + title + optional highlighter word + action ── */
export function PageHeader({ kicker, title, highlight, tail, action, icon, tone = 'stone', description }: { kicker?: string; title: string; highlight?: string; tail?: string; action?: ReactNode; icon?: string; tone?: Tone; description?: ReactNode }) {
  return (
    <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
        {icon && <IconTile icon={icon} tone={tone} size={62} />}
        <div style={{ minWidth: 0 }}>
          {kicker && <div className="sb-kicker">{kicker}</div>}
          <h1 style={{ margin: kicker ? '6px 0 0' : 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(30px,5.5vw,44px)', lineHeight: 1.04, letterSpacing: '-.035em', textWrap: 'balance' as CSSProperties['textWrap'] }}>
            {title}{highlight && <> <span className="sb-hi">{highlight}</span></>}{tail}
          </h1>
          {description && <p style={{ margin: '8px 0 0', color: 'var(--sb-muted)', fontSize: 15.5, lineHeight: 1.55, maxWidth: 620 }}>{description}</p>}
        </div>
      </div>
      {action}
    </header>
  )
}

/* ── Buttons ── */
type BtnKind = 'primary' | 'accent' | 'secondary' | 'danger'
export function Btn({ kind = 'primary', children, href, onClick, icon, style, type = 'button' }: { kind?: BtnKind; children: ReactNode; href?: string; onClick?: () => void; icon?: string; style?: CSSProperties; type?: 'button' | 'submit' }) {
  const k: Record<BtnKind, CSSProperties> = {
    primary: { background: 'var(--sb-primary)', color: 'var(--sb-primary-fg)', border: 'none' },
    accent: { background: '#FF9933', color: '#0A0F24', border: 'none' },
    secondary: { background: 'transparent', color: 'inherit', border: '1.5px solid currentColor' },
    danger: { background: 'transparent', color: 'var(--sb-danger-ink)', border: '1.5px solid var(--sb-danger)' },
  }
  const s: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, padding: '0 22px', borderRadius: 16, fontWeight: 800, fontSize: 15, cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', ...k[kind], ...style }
  const inner = <>{children}{icon && <Icon name={icon} size={18} weight="bold" />}</>
  return href
    ? <motion.span whileTap={{ scale: 0.96 }} style={{ display: 'inline-flex' }}><Link href={href} style={s}>{inner}</Link></motion.span>
    : <motion.button type={type} whileTap={{ scale: 0.96 }} onClick={onClick} style={s}>{inner}</motion.button>
}

/* ── EmptyState + Skeleton ── */
export function EmptyState({ icon = 'sparkle', title, body, action }: { icon?: string; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <IconTile icon={icon} tone="saf" size={64} />
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 22 }}>{title}</div>
      {body && <div style={{ color: 'var(--sb-muted)', maxWidth: 420, lineHeight: 1.55 }}>{body}</div>}
      {action}
    </div>
  )
}

export function Skeleton({ height = 80, style }: { height?: number; style?: CSSProperties }) {
  return <div className="sb-skeleton" style={{ height, ...style }} aria-hidden />
}

/** Rise-in wrapper with optional stagger index (use for sections, tiles, KPI rows). */
export function Rise({ children, i = 0, style }: { children: ReactNode; i?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  return (
    <motion.div ref={ref} style={style} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1], delay: i * 0.05 }}>
      {children}
    </motion.div>
  )
}
