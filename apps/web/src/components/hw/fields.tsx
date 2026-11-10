// Small form primitives shared by the hw screens. Native <select> on purpose: it is the
// most usable picker on tablets and phones.

import type { ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

export function NativeSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn('h-12 w-full rounded-2xl border-[1.5px] border-input bg-card px-4 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-ring', className)}
    />
  )
}
