'use client'

// Page frame for every Handwritten Assignments screen: title, language switch, and the
// feature gate (switched off / not in an institution) so no page renders half-working.

import { PageHeader, Skeleton } from '@/components/sb'
import type { ReactNode } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useHwT, type HwKey } from './strings'

export function useHwStatus() {
  return api.hw.status.useQuery(undefined, { staleTime: 60_000, retry: false })
}

export function HwLanguageToggle() {
  const { t, lang, setLang } = useHwT()
  return (
    <Button variant="outline" size="sm" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} aria-label="Language">
      {t('lang.toggle')}
    </Button>
  )
}

export function HwMessage({ tone = 'info', children }: { tone?: 'info' | 'error'; children: ReactNode }) {
  return (
    <Card className={tone === 'error' ? 'border-sb-danger ' : undefined}>
      <CardContent className="flex items-start gap-3 py-6 text-sm">
        {tone === 'error' && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-sb-rose-ink" aria-hidden />}
        <div>{children}</div>
      </CardContent>
    </Card>
  )
}

export function HwLoading() {
  const { t } = useHwT()
  return (
    <div className="space-y-3 py-4" role="status" aria-label={t('common.loading')}>
      <Skeleton height={72} />
      <Skeleton height={72} />
      <Skeleton height={72} />
    </div>
  )
}

export function HwError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useHwT()
  return (
    <HwMessage tone="error">
      <p>{t('common.error', { msg: message })}</p>
      {onRetry && <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}>{t('common.retry')}</Button>}
    </HwMessage>
  )
}

interface HwShellProps {
  titleKey?: HwKey
  title?: string
  subtitle?: string
  actions?: ReactNode
  /** Roles that may use this page; others see a message instead of the page. */
  roles: ('admin' | 'teacher' | 'student' | 'parent')[]
  children: ReactNode
}

export function HwShell({ titleKey = 'app.title', title, subtitle, actions, roles, children }: HwShellProps) {
  const { t } = useHwT()
  const status = useHwStatus()

  let body: ReactNode = children
  if (status.isLoading) body = <HwLoading />
  else if (status.error) body = <HwError message={status.error.message} onRetry={() => status.refetch()} />
  else if (!status.data?.orgId) body = <HwMessage>{t('app.noOrg')}</HwMessage>
  else if (!status.data.enabled) body = <HwMessage>{t('app.off')}</HwMessage>
  else if (!roles.includes(status.data.role as never)) body = <HwMessage>{t('app.noAccess')}</HwMessage>

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        kicker="Virat Evaluator"
        icon="evaluation"
        tone="sky"
        title={title ?? t(titleKey)}
        description={subtitle ?? t('app.subtitle')}
        action={<div className="flex flex-wrap items-center gap-2">{actions}<HwLanguageToggle /></div>}
      />
      {body}
    </div>
  )
}
