'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'

/**
 * Shown on the tutor page for a student who has finished onboarding but has no plan yet
 * (/api/user/subscription → NO_SUBSCRIPTION). Starts the free trial in place — no alert(), no full reload.
 */
export function StartTrialCard({ onStarted }: { onStarted: () => void | Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/user/subscription/create-trial', { method: 'POST', credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        await onStarted()
      } else {
        setError(data.message || data.error || 'Could not start the free trial. Please try again.')
      }
    } catch {
      setError('Network problem. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: 'var(--sb-grad-stage)', color: '#fff', border: 'none' }}>
      <span style={{ width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.12)', flex: 'none' }}>
        <Icon name="sparkle" size={22} weight="duotone" color="#FF9933" />
      </span>
      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>Start your free trial to ask Gyankosh</h3>
        <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.8 }}>
          Your board and class are saved. The trial gives you a daily question allowance — no card needed.
        </p>
        {error && <p role="alert" style={{ margin: '6px 0 0', fontSize: 13, color: '#FFB4A8' }}>{error}</p>}
      </div>
      <button
        onClick={start}
        disabled={busy}
        style={{ height: 44, padding: '0 20px', borderRadius: 14, border: 'none', cursor: busy ? 'wait' : 'pointer', fontWeight: 800, fontSize: 14.5, color: '#1a1206', background: 'var(--sb-grad-primary)', opacity: busy ? 0.7 : 1 }}
      >
        {busy ? 'Starting…' : 'Start free trial'}
      </button>
    </div>
  )
}
