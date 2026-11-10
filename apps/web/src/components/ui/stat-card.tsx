'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Accent = 'brand' | 'orange' | 'blue' | 'indigo' | 'violet' | 'green' | 'red' | 'cyan'

const ACCENTS: Record<Accent, { chip: string; bar: string; chipShadow: string }> = {
  // brand = this app's actual accent (turmeric in DGCL, saffron in PDLMS, etc.)
  // via the Indic tokens, not a hardcoded orange/blue that happened to look similar.
  brand:  { chip: 'from-[var(--accent-primary)] to-[var(--accent-strong)]', bar: 'from-[var(--gold)] via-[var(--accent-primary)] to-[var(--accent-strong)]', chipShadow: 'shadow-[0_8px_20px_-6px_rgb(var(--accent-strong-rgb)/0.5)]' },
  orange: { chip: ' ', bar: ' ',               chipShadow: 'shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)]' },
  blue:   { chip: ' ',     bar: ' ',                   chipShadow: 'shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)]' },
  indigo: { chip: ' ', bar: ' ',               chipShadow: 'shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)]' },
  violet: { chip: ' ',bar: ' ',              chipShadow: 'shadow-[0_8px_20px_-6px_rgba(139,92,246,0.5)]' },
  green:  { chip: ' ',  bar: ' ',                chipShadow: 'shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)]' },
  red:    { chip: ' ',      bar: ' ',                    chipShadow: 'shadow-[0_8px_20px_-6px_rgba(244,63,94,0.5)]' },
  cyan:   { chip: ' ',      bar: ' ',                    chipShadow: 'shadow-[0_8px_20px_-6px_rgba(6,182,212,0.5)]' },
}

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  description?: string
  accent?: Accent
  className?: string
}

export function StatCard({
  icon: Icon,
  title,
  value,
  change,
  changeType = 'neutral',
  description,
  accent = 'brand',
  className,
}: StatCardProps) {
  const a = ACCENTS[accent]
  const changeColors = {
    positive: 'text-sb-saffron-deep bg-sb-saffron-tint  ',
    negative: 'text-sb-rose-ink bg-sb-rose  ',
    neutral: 'text-muted-foreground bg-muted dark:bg-white/5',
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-elev-2 dc-hover-lift',
        className
      )}
    >
      <span className={cn('absolute inset-x-0 top-0 h-[3px] bg-sb-surface-2 opacity-90', a.bar)} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums text-foreground">{value}</p>
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sb-surface-2 text-white transition-transform duration-300 group-hover:scale-105',
            a.chip,
            a.chipShadow
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {change ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', changeColors[changeType])}>
            {change}
          </span>
          {description && <span className="text-xs text-muted-foreground">{description}</span>}
        </div>
      ) : (
        description && <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  color?: 'orange' | 'blue' | 'green' | 'red' | 'purple'
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  color = 'orange',
}: MetricCardProps) {
  const colorChip: Record<NonNullable<MetricCardProps['color']>, string> = {
    orange: ' ',
    blue: ' ',
    green: ' ',
    red: ' ',
    purple: ' ',
  }

  const trendColors = {
    up: 'text-sb-saffron-deep ',
    down: 'text-sb-rose-ink ',
    neutral: 'text-muted-foreground',
  }

  return (
    <div className="group rounded-2xl border border-border/70 bg-card p-4 shadow-elev-1 transition-shadow duration-300 hover:shadow-elev-2">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sb-surface-2 text-white shadow-sm',
            colorChip[color]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold tabular-nums text-foreground">{value}</p>
            {trend && (
              <span className={cn('text-xs font-medium', trendColors[trend.direction])}>
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
