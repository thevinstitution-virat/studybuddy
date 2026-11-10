'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Brand } from '@/components/sb/Brand'
import { ThemeToggle } from '@/components/sb/ThemeToggle'
import { Icon } from '@/components/ui/Icon'

/**
 * AuthShell — split auth layout (Redesign Brief §7.8).
 *
 * Left: a navy brand panel with the headline "Study with a buddy that cites the book." (last words
 * in saffron) and a slow dashed ring. Right: the form on paper. On a phone the navy panel becomes a
 * 300px header band above the form. The day/night toggle sits top-right. App-local rather than the
 * vendored AuthBackdrop, which carries the lotus mandala this app does not want.
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
    <div className="sb-auth">
      <aside className="sb-auth-panel">
        <span aria-hidden className="sb-auth-ring" />
        <Link href="/" style={{ position: 'relative', textDecoration: 'none', color: '#fff' }}><Brand onNavy /></Link>
        <div style={{ position: 'relative', marginTop: 'auto' }}>
          <h2 className="sb-auth-headline">
            Study with a buddy that <span style={{ color: '#FF9933' }}>cites the book.</span>
          </h2>
          <p className="sb-auth-sub">Every answer shows the NCERT chapter and page. If it isn&apos;t in your books, Study Buddy says so.</p>
          <ul className="sb-auth-points">
            {['Gyankosh answers from your textbook', 'InkBuddy marks your handwriting', 'Hindi and English, Classes 6–12'].map((t) => (
              <li key={t}><Icon name="check" size={16} weight="bold" color="#FF9933" />{t}</li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="sb-auth-form">
        <div style={{ position: 'absolute', top: 12, right: 12 }}><ThemeToggle /></div>
        <div className="sb-auth-card">
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--sb-font-display)', fontWeight: 700, fontSize: 'clamp(28px,4vw,36px)', lineHeight: 1.08, letterSpacing: '-.035em', color: 'var(--sb-ink)' }}>
              {title}
            </h1>
            {subtitle && <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.55, color: 'var(--sb-muted)' }}>{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
