'use client'

import { useSession } from '@/auth/client'
import { UserRole as Roles } from '@/lib/validations'
import {
  UserIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CogIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

interface RoleIndicatorProps {
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showText?: boolean
  className?: string
}

const roleConfig = {
  admin: {
    icon: CogIcon,
    label: 'Administrator',
    color: 'red',
    bgColor: 'bg-sb-rose ',
    textColor: 'text-sb-rose-ink ',
    iconColor: 'text-sb-rose-ink ',
  },
  teacher: {
    icon: UserGroupIcon,
    label: 'Teacher',
    color: 'green',
    bgColor: 'bg-sb-saffron-tint ',
    textColor: 'text-sb-saffron-deep ',
    iconColor: 'text-sb-saffron-deep ',
  },
  student: {
    icon: AcademicCapIcon,
    label: 'Student',
    color: 'blue',
    bgColor: 'bg-sb-sky ',
    textColor: 'text-sb-sky-ink ',
    iconColor: 'text-sb-sky-ink ',
  },
  parent: {
    icon: HeartIcon,
    label: 'Parent',
    color: 'purple',
    bgColor: 'bg-sb-lav ',
    textColor: 'text-sb-lav-ink ',
    iconColor: 'text-sb-lav-ink ',
  },
}

const sizeConfig = {
  sm: {
    container: 'px-2 py-1 text-xs',
    icon: 'w-3 h-3',
    text: 'text-xs',
  },
  md: {
    container: 'px-3 py-1 text-sm',
    icon: 'w-4 h-4',
    text: 'text-sm',
  },
  lg: {
    container: 'px-4 py-2 text-base',
    icon: 'w-5 h-5',
    text: 'text-base',
  },
}

export function RoleIndicator({
  size = 'md',
  showIcon = true,
  showText = true,
  className = '',
}: RoleIndicatorProps) {
  const { data: session, isPending } = useSession()
  const user = session?.user

  if (isPending) {
    return (
      <div className={`animate-pulse ${sizeConfig[size].container} bg-gray-200 dark:bg-gray-700 rounded-full ${className}`}>
        <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    )
  }

  const userRole = (user as any)?.role as Roles

  if (!userRole) {
    return (
      <div className={`${sizeConfig[size].container} bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full flex items-center space-x-1 ${className}`}>
        {showIcon && <UserIcon className={sizeConfig[size].icon} />}
        {showText && <span className={sizeConfig[size].text}>No Role</span>}
      </div>
    )
  }

  const config = roleConfig[userRole as keyof typeof roleConfig]
  const Icon = config?.icon || UserIcon

  return (
    <div className={`${sizeConfig[size].container} ${config.bgColor} ${config.textColor} rounded-full flex items-center space-x-1 font-medium ${className}`}>
      {showIcon && <Icon className={`${sizeConfig[size].icon} ${config.iconColor}`} />}
      {showText && <span className={sizeConfig[size].text}>{config.label}</span>}
    </div>
  )
}
