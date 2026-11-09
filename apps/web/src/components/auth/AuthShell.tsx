'use client'

import type { ReactNode } from 'react'
import MandalaMark from '@/components/dashboard/MandalaMark'

/**
 * AuthShell — the single centered auth card on the Buddy "stage".
 *
 * Navy stage gradient with a blaze + cobalt corner glow behind one raised card
 * (the same backdrop as Book Buddy's auth), with the Study Buddy mark above the
 * title. App-local rather than the vendored AuthBackdrop, which carries the
 * lotus mandala and a brand aside this app does not want.
 *
 * The title is forced to the display face (Bricolage) via an arbitrary-property
 * class, which beats the global element rule without touching it.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16"
      style={{ background: 'var(--bb-grad-stage)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(38rem 30rem at 86% -8%, rgb(255 77 0 / 0.30), transparent 62%), radial-gradient(40rem 32rem at 4% 108%, rgb(59 91 219 / 0.34), transparent 62%)',
        }}
      />
      <div className="relative w-full max-w-[440px] animate-scale-in rounded-[28px] border border-border bg-card p-7 shadow-[var(--bb-shadow-stage)] motion-reduce:animate-none sm:p-9">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <MandalaMark size={48} spinCls="" />
          </div>
          <h1 className="text-[clamp(26px,3.4vw,32px)] font-extrabold leading-[1.1] tracking-tight text-foreground [font-family:var(--bb-font-display)]">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-[14.5px] text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}
