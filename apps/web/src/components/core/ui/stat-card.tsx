'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  description?: string
  className?: string
}

export function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  description,
  className
}: StatCardProps) {
  const changeColors = {
    positive: 'text-sb-saffron-deep bg-sb-saffron-tint  ',
    negative: 'text-sb-rose-ink bg-sb-rose  ',
    neutral: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
  }

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-sb-saffron ",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sb-surface-2     rounded-lg">
            <Icon className="h-6 w-6 text-sb-saffron-deep " />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          </div>
        </div>
        {change && (
          <div className={cn("px-2 py-1 rounded-full text-xs font-medium", changeColors[changeType])}>
            {change}
          </div>
        )}
      </div>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{description}</p>
      )}
    </div>
  )
}

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  color?: 'orange' | 'blue' | 'green' | 'red' | 'purple'
}

export function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  color = 'orange'
}: MetricCardProps) {
  const colorClasses = {
    orange: 'text-sb-saffron-deep bg-sb-saffron-tint  ',
    blue: 'text-sb-sky-ink bg-sb-sky  ',
    green: 'text-sb-saffron-deep bg-sb-saffron-tint  ',
    red: 'text-sb-rose-ink bg-sb-rose  ',
    purple: 'text-sb-lav-ink bg-sb-lav  '
  }

  const trendColors = {
    up: 'text-sb-saffron-deep ',
    down: 'text-sb-rose-ink ',
    neutral: 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
            {trend && (
              <span className={cn("text-xs font-medium", trendColors[trend.direction])}>
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
