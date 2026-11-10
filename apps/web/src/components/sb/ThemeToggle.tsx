'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Icon } from '@/components/ui/Icon'

/**
 * Day / night toggle. One tap flips between light and dark (the `.dark` class set by
 * next-themes, which swaps every --sb-* token). The preference is remembered; until the
 * visitor picks one it follows the system.
 *
 * `variant="icon"`  44px round button for app bars and nav.
 * `variant="pill"`  labelled, for the footer / More page / settings.
 */
export function ThemeToggle({
  variant = 'icon',
  onNavy = false,
  className = '',
}: {
  variant?: 'icon' | 'pill'
  /** Set when the toggle sits on a navy surface (sidebar, rail) so it uses on-navy colours. */
  onNavy?: boolean
  className?: string
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const dark = mounted && resolvedTheme === 'dark'
  const next = dark ? 'light' : 'dark'
  const label = dark ? 'Switch to day mode' : 'Switch to night mode'
  const fg = onNavy ? 'var(--sb-on-navy)' : 'var(--sb-ink)'
  const hover = onNavy ? '#FFFFFF1A' : 'color-mix(in srgb, var(--sb-ink) 8%, transparent)'

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        aria-label={label}
        aria-pressed={dark}
        className={className}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 16px 0 12px',
          borderRadius: 999, border: '1.5px solid var(--sb-line)', background: 'var(--sb-surface)', color: 'var(--sb-ink)',
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}
      >
        <span style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 999, background: 'var(--sb-saffron-tint)', color: 'var(--sb-saffron-deep)' }}>
          <Icon name={dark ? 'moon' : 'sun'} size={18} weight="fill" />
        </span>
        {dark ? 'Night' : 'Day'} mode
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      aria-pressed={dark}
      title={label}
      className={className}
      style={{
        position: 'relative', width: 44, height: 44, borderRadius: 999, border: 'none', background: 'transparent',
        color: fg, display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'background .2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span
        key={dark ? 'moon' : 'sun'}
        style={{ display: 'grid', placeItems: 'center', animation: 'sbPop .4s both', color: onNavy ? 'var(--sb-saffron)' : undefined }}
      >
        <Icon name={dark ? 'moon' : 'sun'} size={22} weight={dark ? 'fill' : 'regular'} />
      </span>
    </button>
  )
}

export default ThemeToggle
