'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/solid'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { notifications, removeNotification } = useUIStore()

  return (
    <>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </>
  )
}

interface NotificationItemProps {
  notification: {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: Date
  }
  onRemove: () => void
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const { type, title, message } = notification

  // Auto-remove after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onRemove, 5000)
    return () => clearTimeout(timer)
  }, [onRemove])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-sb-saffron-deep" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-sb-rose-ink" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-sb-butter-ink" />
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-sb-sky-ink" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-sb-saffron-tint border-sb-saffron  '
      case 'error':
        return 'bg-sb-rose border-sb-danger  '
      case 'warning':
        return 'bg-sb-butter border-sb-butter  '
      case 'info':
        return 'bg-sb-sky border-sb-sky  '
    }
  }

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full",
        getStyles()
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground">
            {title}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {message}
          </p>
        </div>
        
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground dark:hover:text-gray-200 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
