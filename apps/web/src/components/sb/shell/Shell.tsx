'use client'

/**
 * Study Buddy shell chrome (Redesign Brief §4): BottomNav (phone), NavRail (tablet), TopAppBar,
 * Fab + SpeedDial, and the full-page More screen. Which one shows is decided by CSS breakpoints
 * (sb-shell.css), not JS: <640 phone, 640–1023 tablet, >=1024 desktop sidebar.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { BrandTile } from '@/components/sb/Brand'
import { ThemeToggle } from '@/components/sb/ThemeToggle'
import { useDashboardShell } from '@/contexts/DashboardShellContext'
import { authClient } from '@/auth/client'
import { detectRole, fabHidden, isRootPage, navIconName, tabActive, type RoleConfig } from './roles'

const SPRING = { type: 'spring', stiffness: 500, damping: 30 } as const

/* ───────────── bottom navigation (phone) ───────────── */

export function BottomNav({ role, onMore, moreOpen }: { role: RoleConfig; onMore: () => void; moreOpen: boolean }) {
  const pathname = usePathname()
  return (
    <nav className="sb-bottomnav" aria-label="Primary">
      {role.tabs.map((t) => {
        const on = !moreOpen && tabActive(t, pathname)
        return (
          <Link key={t.href} href={t.href} aria-label={t.name} aria-current={on ? 'page' : undefined} className="sb-tab" data-on={on}>
            <span className="sb-tab-pill">
              {on && <motion.span layoutId="nav-pill" className="sb-tab-pill-bg" transition={SPRING} />}
              <Icon name={t.icon} size={24} active={on} className="sb-tab-ic" />
            </span>
            <span className="sb-tab-label">{t.name}</span>
          </Link>
        )
      })}
      <button type="button" onClick={onMore} aria-label="More" aria-expanded={moreOpen} className="sb-tab" data-on={moreOpen}>
        <span className="sb-tab-pill">
          {moreOpen && <motion.span layoutId="nav-pill" className="sb-tab-pill-bg" transition={SPRING} />}
          <Icon name="more" size={24} active={moreOpen} className="sb-tab-ic" />
        </span>
        <span className="sb-tab-label">More</span>
      </button>
    </nav>
  )
}

/* ───────────── navigation rail (tablet) ───────────── */

export function NavRail({ role, onMore, moreOpen }: { role: RoleConfig; onMore: () => void; moreOpen: boolean }) {
  const pathname = usePathname()
  return (
    <nav className="sb-rail" aria-label="Primary">
      <div style={{ padding: '4px 0 10px' }}><BrandTile size={44} /></div>
      {role.tabs.map((t) => {
        const on = !moreOpen && tabActive(t, pathname)
        return (
          <Link key={t.href} href={t.href} aria-label={t.name} aria-current={on ? 'page' : undefined} className="sb-tab" data-on={on}>
            <span className="sb-tab-pill">
              {on && <motion.span layoutId="rail-pill" className="sb-tab-pill-bg" transition={SPRING} />}
              <Icon name={t.icon} size={24} active={on} className="sb-tab-ic" />
            </span>
            <span className="sb-tab-label">{t.name}</span>
          </Link>
        )
      })}
      <button type="button" onClick={onMore} aria-label="More" aria-expanded={moreOpen} className="sb-tab" data-on={moreOpen}>
        <span className="sb-tab-pill">
          {moreOpen && <motion.span layoutId="rail-pill" className="sb-tab-pill-bg" transition={SPRING} />}
          <Icon name="more" size={24} active={moreOpen} className="sb-tab-ic" />
        </span>
        <span className="sb-tab-label">More</span>
      </button>
      <div style={{ marginTop: 'auto' }}><ThemeToggle onNavy /></div>
    </nav>
  )
}

/* ───────────── top app bar ───────────── */

export function TopAppBar({ role, title, kicker, account }: { role: RoleConfig; title: string; kicker: string; account: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [pathname])

  const root = isRootPage(role, pathname)
  const goBack = () => {
    // Real history when there is some, otherwise the role home.
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push(role.home)
  }

  return (
    <header className="sb-topbar" data-scrolled={scrolled}>
      {/* phone: back arrow on subpages, brand tile on root tab pages */}
      <div className="sb-topbar-lead">
        {root ? (
          <span className="sb-only-phone"><BrandTile size={36} /></span>
        ) : (
          <button type="button" className="sb-iconbtn" onClick={goBack} aria-label="Back"><Icon name="back" size={22} /></button>
        )}
      </div>
      <div className="sb-topbar-title" data-root={root} data-scrolled={scrolled}>
        <div className="sb-kicker">{kicker}</div>
        <h1>{title}</h1>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        <ThemeToggle />
        <button type="button" className="sb-iconbtn" aria-label="Notifications" style={{ position: 'relative' }}>
          <Icon name="notifications" size={22} />
          <span style={{ position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: '50%', background: 'var(--sb-danger)', border: '2px solid var(--sb-paper)' }} />
        </button>
        <span className="sb-only-wide">{account}</span>
      </div>
    </header>
  )
}

/* ───────────── FAB + speed-dial ───────────── */

export function Fab({ role }: { role: RoleConfig }) {
  const pathname = usePathname()
  const router = useRouter()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [extended, setExtended] = useState(true)
  const root = isRootPage(role, pathname)

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const on = () => setExtended(window.scrollY < 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) } }
    window.addEventListener('keydown', k, true)
    return () => window.removeEventListener('keydown', k, true)
  }, [open])

  if (fabHidden(pathname)) return null
  const showLabel = root && extended && !open

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="sb-scrim" onClick={() => setOpen(false)} aria-hidden
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          />
        )}
      </AnimatePresence>
      <div className="sb-fab-wrap">
        <AnimatePresence>
          {open && (
            <motion.div className="sb-dial" role="menu" aria-label={`${role.label} actions`}>
              {role.actions.map((a, i) => (
                <motion.button
                  key={a.label} type="button" role="menuitem" className="sb-dial-item"
                  onClick={() => { setOpen(false); router.push(a.href) }}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 14 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, scale: [0.6, 1.06, 1], y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
                  transition={{ duration: 0.35, delay: (role.actions.length - 1 - i) * 0.04 }}
                  style={{ transformOrigin: 'right center' }}
                >
                  <span className="sb-dial-label">{a.label}</span>
                  <span className="sb-dial-tile"><Icon name={a.icon} size={24} weight="duotone" /></span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          type="button" className="sb-fab" aria-label={open ? 'Close menu' : 'Create'} aria-expanded={open}
          onClick={() => setOpen((o) => !o)} whileTap={{ scale: 0.96 }} layout transition={SPRING}
        >
          <motion.span animate={{ rotate: open ? 45 : 0 }} transition={SPRING} style={{ display: 'grid', placeItems: 'center' }}>
            <Icon name="add" size={26} weight="bold" />
          </motion.span>
          {showLabel && <span className="sb-fab-text">{role.fabLabel}</span>}
        </motion.button>
      </div>
    </>
  )
}

/* ───────────── More (a full page, not a drawer) ───────────── */

export function MoreScreen({ role, open, onClose }: { role: RoleConfig; open: boolean; onClose: () => void }) {
  const shell = useDashboardShell()
  const router = useRouter()
  const pathname = usePathname()
  const first = useRef(true)
  const data = shell?.data

  useEffect(() => { if (first.current) { first.current = false; return } onClose() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [open, onClose])

  const items = data?.items ?? []
  const groups: { title: string; items: typeof items }[] = []
  for (const it of items) {
    const title = it.section || 'Menu'
    const last = groups[groups.length - 1]
    if (last && last.title === title) last.items.push(it)
    else groups.push({ title, items: [it] })
  }

  const signOut = async () => {
    try { await authClient.signOut() } catch (e) { console.error('Logout failed:', e) }
    finally { router.replace('/sign-in') }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="sb-more" role="dialog" aria-modal="true" aria-label="More"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="sb-more-bar">
            <button type="button" className="sb-iconbtn" onClick={onClose} aria-label="Back"><Icon name="back" size={22} /></button>
            <span style={{ fontFamily: 'var(--sb-font-display)', fontWeight: 700, fontSize: 20 }}>More</span>
            <span style={{ marginLeft: 'auto' }}><ThemeToggle /></span>
          </div>
          <div className="sb-more-body">
            <Link href={data?.profilePath || '/dashboard/user/profile'} className="sb-more-profile" onClick={onClose}>
              <span className="sb-more-avatar">{data?.user?.initials || 'U'}</span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 17, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data?.user?.name || 'Your account'}</span>
                <span style={{ display: 'block', fontSize: 13, color: 'var(--sb-on-navy-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data?.user?.email || data?.brandName}</span>
              </span>
              <span className="sb-more-role">{role.label}</span>
            </Link>

            {groups.map((g) => (
              <section key={g.title}>
                <div className="sb-kicker" style={{ margin: '22px 4px 10px' }}>{g.title}</div>
                <div className="sb-more-grid">
                  {g.items.map((it) => {
                    const sem = navIconName(it.name)
                    const Lucide = it.icon
                    return (
                      <Link key={it.href} href={it.href} className="sb-more-tile" onClick={onClose}>
                        <span className="sb-more-ic">{sem ? <Icon name={sem} size={24} weight="duotone" /> : <Lucide className="h-6 w-6" />}</span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontWeight: 800, fontSize: 14.5, lineHeight: 1.25 }}>{it.name}</span>
                          {it.description && <span className="sb-more-desc">{it.description}</span>}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </section>
            ))}

            <button type="button" className="sb-more-signout" onClick={signOut}>
              <Icon name="sign-out" size={20} />Sign out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { detectRole }
