'use client'

import React from 'react'
import { Coins, Plus } from 'lucide-react'

interface CreditBadgeProps {
    showAddButton?: boolean
    className?: string
}

export function CreditBadge({ showAddButton = true, className = '' }: CreditBadgeProps) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-sb-sky  text-sb-sky-ink  rounded-full text-sm font-medium border border-sb-sky  ${className}`}>
            <Coins className="w-4 h-4 text-sb-butter-ink" />
            <span>1,000 Credits</span>
            {showAddButton && (
                <button className="ml-1 p-0.5 bg-sb-navy text-white rounded-full hover:bg-sb-navy focus:outline-none focus:ring-2 focus:ring-sb-sky">
                    <Plus className="w-3 h-3" />
                </button>
            )}
        </div>
    )
}
