// src/components/dashboard/PageHeader.tsx
// Reusable modern page header for super-admin (and other) dashboard pages.
// Replaces the legacy gradient clip-text headers with a clean icon + title block.

import type { ComponentType, ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: ComponentType<{ className?: string }>
  /** Tailwind gradient stops for the icon chip, e.g. ' '. */
  gradient?: string
  /** Right-aligned actions (buttons, links). */
  actions?: ReactNode
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  gradient = ' ',
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sb-surface-2 ${gradient} text-white shadow-lg `}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
