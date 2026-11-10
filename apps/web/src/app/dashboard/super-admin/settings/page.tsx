'use client'

import React, { useState, useEffect } from 'react'
import { Settings, Shield, Bell, Database, Monitor, Server, CheckCircle, Save, Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import PageHeader from '@/components/dashboard/PageHeader'
import { trpc } from '@/lib/trpc/client'

const cardClass = 'rounded-2xl border border-border/70 bg-card p-6 shadow-sm dark:border-white/10'
const rowClass = 'flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 dark:border-white/5 dark:bg-white/[0.02]'

function SectionTitle({ icon: Icon, tint, title, desc }: { icon: React.ComponentType<{ className?: string }>; tint: string; title: string; desc: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  const { data: config, isLoading, refetch } = trpc.superAdmin.getSystemSettings.useQuery()
  const updateSettings = trpc.superAdmin.updateSystemSettings.useMutation({
    onSuccess: () => {
      setSuccessMessage('Settings saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
      refetch()
    }
  })

  // We maintain a local state that initializes from DB, allowing UI edits before saving
  const [localSettings, setLocalSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    sessionTimeoutMinutes: 60,
    // Add decorative settings to match existing UI
    autoBackup: true,
    emailNotifications: true,
    systemAlerts: true,
    userRegistration: true,
    guestAccess: false,
    dataRetention: 365,
    maxFileSize: 100,
  })

  useEffect(() => {
    if (config) {
      setLocalSettings(prev => ({
        ...prev,
        maintenanceMode: config.maintenanceMode ?? false,
        debugMode: config.debugMode ?? false,
        sessionTimeoutMinutes: config.sessionTimeoutMinutes ?? 60,
      }))
    }
  }, [config])

  const [successMessage, setSuccessMessage] = useState('')

  const handleSave = () => {
    updateSettings.mutate({
      maintenanceMode: localSettings.maintenanceMode,
      debugMode: localSettings.debugMode,
      sessionTimeoutMinutes: localSettings.sessionTimeoutMinutes,
    })
  }

  const update = (key: keyof typeof localSettings, value: boolean | number) =>
    setLocalSettings((prev) => ({ ...prev, [key]: value }))

  const Toggle = ({ k, label, desc }: { k: keyof typeof localSettings; label: string; desc: string }) => (
    <div className={rowClass}>
      <div>
        <label className="text-sm font-semibold text-foreground">{label}</label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={localSettings[k] as boolean} onCheckedChange={(c) => update(k, c)} />
    </div>
  )

  const numberInput = 'w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 dark:text-white'

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        icon={Settings}
        title="System Settings"
        subtitle="Configure system-wide settings and preferences"
        actions={
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-sb-navy  to-primary/80 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl disabled:opacity-50"
          >
            {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 
            {updateSettings.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-sb-saffron bg-sb-saffron-tint p-4  ">
          <CheckCircle className="h-5 w-5 text-sb-saffron-deep" />
          <p className="text-sm font-medium text-sb-saffron-deep ">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <SectionTitle icon={Monitor} tint="bg-sb-saffron-tint text-sb-saffron-deep  " title="System Control" desc="Core operational modes (Live)" />
          <div className="space-y-3">
            <Toggle k="maintenanceMode" label="Maintenance Mode" desc="Temporarily disable user access" />
            <Toggle k="debugMode" label="Debug Mode" desc="Enable detailed error logging" />
            <Toggle k="autoBackup" label="Auto Backup (Mock)" desc="Automatic daily system backups" />
          </div>
        </div>

        <div className={cardClass}>
          <SectionTitle icon={Shield} tint="bg-primary/10 text-primary dark:bg-primary/100" title="User Management" desc="Access & registration" />
          <div className="space-y-3">
            <Toggle k="userRegistration" label="User Registration (Mock)" desc="Allow new user signups" />
            <Toggle k="guestAccess" label="Guest Access (Mock)" desc="Allow anonymous browsing" />
            <div className="rounded-xl border border-border bg-muted/40 p-4 dark:border-white/5 dark:bg-white/[0.02]">
              <label className="mb-2 block text-sm font-semibold text-foreground">Session Timeout (minutes, Live)</label>
              <input type="number" min={5} max={480} value={localSettings.sessionTimeoutMinutes} onChange={(e) => update('sessionTimeoutMinutes', parseInt(e.target.value) || 60)} className={numberInput} />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <SectionTitle icon={Bell} tint="bg-sb-butter text-sb-butter-ink  " title="Notifications" desc="Alerts & preferences" />
          <div className="space-y-3">
            <Toggle k="emailNotifications" label="Email Notifications (Mock)" desc="Send admin alerts via email" />
            <Toggle k="systemAlerts" label="System Alerts (Mock)" desc="In-app system notifications" />
          </div>
        </div>

        <div className={cardClass}>
          <SectionTitle icon={Database} tint="bg-sb-saffron-tint text-sb-saffron-deep  " title="Data Management" desc="Retention & storage" />
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-muted/40 p-4 dark:border-white/5 dark:bg-white/[0.02]">
              <label className="mb-2 block text-sm font-semibold text-foreground">Data Retention (days, Mock)</label>
              <input type="number" min={30} max={3650} value={localSettings.dataRetention} onChange={(e) => update('dataRetention', parseInt(e.target.value) || 365)} className={numberInput} />
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4 dark:border-white/5 dark:bg-white/[0.02]">
              <label className="mb-2 block text-sm font-semibold text-foreground">Max File Size (MB, Mock)</label>
              <input type="number" min={1} max={1000} value={localSettings.maxFileSize} onChange={(e) => update('maxFileSize', parseInt(e.target.value) || 100)} className={numberInput} />
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <SectionTitle icon={Server} tint="bg-primary/10 text-primary dark:bg-primary/100" title="System Status" desc="Live health indicators" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { name: 'Database', state: 'Online', ok: true },
            { name: 'AI Services', state: 'Operational', ok: true },
            { name: 'File Storage', state: 'Available', ok: true },
            { name: 'Backup', state: 'Scheduled', ok: false },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 p-4 dark:border-white/5 dark:bg-white/[0.02]">
              <span className={`h-2 w-2 animate-pulse rounded-full ${s.ok ? 'bg-sb-navy' : 'bg-sb-navy'}`} />
              <div>
                <p className="text-sm font-semibold text-foreground">{s.name}</p>
                <p className={`text-xs font-medium ${s.ok ? 'text-sb-saffron-deep ' : 'text-sb-butter-ink '}`}>{s.state}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
