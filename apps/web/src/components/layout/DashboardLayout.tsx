/**
 * DashboardLayout — the shared app shell (Redesign Brief §4): one shell, three modes chosen by CSS
 * breakpoints. Phone: top app bar + navy bottom navigation + FAB. Tablet: navy rail + FAB. Desktop:
 * the role's grouped navy sidebar + FAB. "More" is a full page (not a drawer) with the whole role nav,
 * and a day/night toggle sits in every top bar.
 *
 * The role sidebar is still the single source of truth for a role's navigation: it reports its items
 * through DashboardShellContext, and the title, More page and bottom bar read from there / roles.ts.
 * A user's role — and therefore which dashboard they see — comes from the auth session on the server;
 * each dashboard route keeps its own access guard. Only chrome changed here: no data, auth or route logic.
 */

'use client'

import React, { ReactNode, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { DashboardShellProvider, useDashboardShell } from '@/contexts/DashboardShellContext'
import AccountMenu from '@/components/layout/AccountMenu'
import { BottomNav, Fab, MoreScreen, NavRail, TopAppBar } from '@/components/sb/shell/Shell'
import { detectRole } from '@/components/sb/shell/roles'

interface DashboardLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  header?: ReactNode
  /** Where the topbar account menu's "Profile" row links. */
  profilePath?: string
}

function activeByPrefix(pathname: string, hrefs: string[]): string | undefined {
  return hrefs
    .filter((h) => pathname === h || pathname.startsWith(h + '/'))
    .sort((a, b) => b.length - a.length)[0]
}

function DashboardLayoutInner({ children, sidebar, header, profilePath }: DashboardLayoutProps) {
  const shell = useDashboardShell()
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const [more, setMore] = useState(false)

  const role = detectRole(pathname)
  const items = shell?.data.items ?? []
  const activeHref = useMemo(() => activeByPrefix(pathname, items.map((i) => i.href)), [pathname, items])
  const activeItem = items.find((i) => i.href === activeHref)
  const title = activeItem?.name || shell?.data.brandName || 'Study Buddy'
  const kicker = shell?.data.roleLabel || role.label

  return (
    <div className="dcd sbshell" style={{ fontFamily: 'var(--sb-font-ui)', color: 'var(--sb-ink)' }}>
      <div className="shell">
        {/* desktop sidebar (hidden below 1024px by CSS; it still reports the nav to the shell) */}
        {sidebar}

        <div className="app-main" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopAppBar role={role} title={title} kicker={kicker} account={<AccountMenu profilePath={profilePath} />} />
          <main>
            {header}
            {/* page transition: rise (opacity 0→1, y 16→0, 450ms) */}
            <motion.div
              key={pathname}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </main>
        </div>

        <NavRail role={role} onMore={() => setMore(true)} moreOpen={more} />
      </div>

      <BottomNav role={role} onMore={() => setMore((m) => !m)} moreOpen={more} />
      <Fab role={role} />
      <MoreScreen role={role} open={more} onClose={() => setMore(false)} />
    </div>
  )
}

export default function DashboardLayout({ children, sidebar, header, profilePath }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardShellProvider>
        <DashboardLayoutInner sidebar={sidebar} header={header} profilePath={profilePath}>
          {children}
        </DashboardLayoutInner>
      </DashboardShellProvider>
    </SidebarProvider>
  )
}
