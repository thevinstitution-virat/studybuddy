'use client'

import { useEffect, useState } from 'react'
import {
    Brain,
    Activity,
    CheckCircle,
    AlertTriangle,
    Coins,
    Users,
    BarChart3,
    Settings,
    Globe,
    Shield,
    Zap,
    Database,
    ExternalLink,
    RefreshCw
} from 'lucide-react'

interface SarvagyaStatus {
    isOnline: boolean
    url: string
    tokenConfigured: boolean
}

export default function AdminSarvagyaPage() {
    const [status, setStatus] = useState<SarvagyaStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        checkServiceStatus()
    }, [])

    const checkServiceStatus = async () => {
        setRefreshing(true)
        try {
            // Attempt to ping the Sarvagya service health endpoint
            const res = await fetch('/api/super-admin/sarvagya/health')
            if (res.ok) {
                const data = await res.json()
                setStatus({
                    isOnline: data.online ?? false,
                    url: data.url ?? 'Not Configured',
                    tokenConfigured: data.tokenConfigured ?? false,
                })
            } else {
                setStatus({
                    isOnline: false,
                    url: 'Checking...',
                    tokenConfigured: false,
                })
            }
        } catch {
            setStatus({
                isOnline: false,
                url: 'Connection Error',
                tokenConfigured: false,
            })
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const configItems = [
        {
            label: 'LLM Provider',
            value: status?.url || '—',
            icon: Globe,
            gradient: 'from-primary ',
            bgColor: 'from-primary/10  dark:from-primary  border-primary/20'
        },
        {
            label: 'API Key',
            value: status?.tokenConfigured ? 'Configured ✓' : 'Not Set ✗',
            icon: Shield,
            gradient: ' ',
            bgColor: status?.tokenConfigured
                ? '    border-sb-saffron'
                : '    border-sb-danger'
        },
        {
            label: 'Connection Status',
            value: status?.isOnline ? 'Online' : 'Offline',
            icon: Activity,
            gradient: status?.isOnline ? ' ' : ' ',
            bgColor: status?.isOnline
                ? '    border-sb-saffron'
                : '    border-sb-danger'
        }
    ]

    const quickActions = [
        {
            name: 'Manage User Subscriptions & Credits',
            href: '/dashboard/super-admin/users',
            description: 'Navigate to user management to view and adjust individual user access and credits',
            gradient: 'from-primary ',
            icon: Users
        },
        {
            name: 'Preview Credit Store',
            href: '/dashboard/sarvagya/store',
            description: 'Preview the credit store packages exactly as users see them',
            gradient: ' ',
            icon: BarChart3
        }
    ]

    const creditStats = [
        { label: 'Default Monthly Quota', value: '100', icon: Coins, gradient: ' ', bgColor: '    border-sb-butter' },
        { label: 'Credit Cost per Query', value: '1', icon: Zap, gradient: 'from-primary to-primary/80', bgColor: 'from-primary/10 to-primary/10 dark:from-primary dark:to-primary border-primary/20' },
        { label: 'Microservice Backend', value: 'FastAPI', icon: Database, gradient: ' ', bgColor: '    border-sb-saffron' },
        { label: 'AI Engine', value: 'Surfsense', icon: Brain, gradient: 'from-primary ', bgColor: 'from-primary/10  dark:from-primary  border-primary/20' },
    ]

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-12 shadow-xl border border-white/20">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-sb-navy   rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                                <Brain className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">
                                <span className="text-sb-saffron-deep  to-primary/80  ">
                                    Loading Sarvagya Config...
                                </span>
                            </h3>
                            <p className="text-muted-foreground text-lg max-w-md mx-auto">
                                Checking microservice connectivity and configuration
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center space-x-2 bg-sb-surface-2   backdrop-blur-sm border border-sb-butter rounded-2xl px-6 py-3 mb-6">
                        <Brain className="h-5 w-5 text-sb-butter-ink" />
                        <span className="text-sm font-medium text-sb-saffron-deep    ">
                            AI Microservice Configuration
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-sb-saffron-deep  to-primary/80   flex items-center justify-center gap-4">
                            <Brain className="h-12 w-12 text-sb-butter-ink" />
                            Sarvagya AI Config
                        </span>
                    </h1>

                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        Manage the Sarvagya (Surfsense) AI research microservice, credit policies, and service connectivity
                    </p>
                </div>

                {/* Service Status Banner */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 bg-sb-navy ${status?.isOnline ? ' ' : ' '} rounded-2xl flex items-center justify-center shadow-lg`}>
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Sarvagya Service Status</h2>
                                <p className="text-muted-foreground">
                                    Internal LLM provider connectivity and health
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={checkServiceStatus}
                                disabled={refreshing}
                                className="p-2 bg-muted rounded-xl hover:bg-muted dark:hover:bg-muted transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
                            </button>

                            <div className={`flex items-center gap-3 px-6 py-3 border rounded-xl ${status?.isOnline
                                ? 'bg-sb-surface-2     border-sb-saffron'
                                : 'bg-sb-surface-2     border-sb-danger'
                                }`}>
                                {status?.isOnline
                                    ? <CheckCircle className="h-5 w-5 text-sb-saffron-deep" />
                                    : <AlertTriangle className="h-5 w-5 text-sb-rose-ink" />
                                }
                                <span className="text-lg font-bold text-foreground">
                                    {status?.isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuration Cards */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20">
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-sb-surface-2 from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                                <Settings className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-sb-saffron-deep  to-primary/80  ">
                                    Service Configuration
                                </h2>
                                <p className="text-muted-foreground">
                                    Current microservice connection parameters
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {configItems.map((item, index) => (
                            <div
                                key={index}
                                className={`p-6 bg-sb-surface-2 ${item.bgColor} rounded-2xl border hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]`}
                            >
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className={`w-10 h-10 bg-sb-surface-2 ${item.gradient} rounded-xl flex items-center justify-center shadow-md`}>
                                        <item.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-foreground">{item.label}</h3>
                                </div>
                                <p className="text-foreground font-medium text-lg truncate">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Credit System Stats */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20">
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-sb-navy   rounded-2xl flex items-center justify-center shadow-lg">
                                <Coins className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-sb-saffron-deep  to-primary/80  ">
                                    System Architecture & Defaults
                                </h2>
                                <p className="text-muted-foreground">
                                    Current platform-wide architecture and static credit policies
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {creditStats.map((stat, index) => (
                            <div
                                key={index}
                                className={`p-6 bg-sb-surface-2 ${stat.bgColor} rounded-2xl border hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 bg-sb-surface-2 ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground mb-2">
                                        {stat.label}
                                    </p>
                                    <p className="text-3xl font-bold text-sb-saffron-deep from-[#FF6B35] via-[#FF4D00] to-[#FF8A3D]  ">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20">
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-sb-surface-2 from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-sb-saffron-deep  to-primary/80  ">
                                    Quick Actions
                                </h2>
                                <p className="text-muted-foreground">
                                    Manage Sarvagya resources and settings
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {quickActions.map((action, index) => (
                            <a
                                key={action.name}
                                href={action.href}
                                className="block p-6 bg-sb-surface-2 from-[var(--panel)] to-[var(--panel-2)] border border-border/50 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-12 h-12 bg-sb-surface-2 ${action.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                                            <action.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground mb-1">
                                                {action.name}
                                            </h3>
                                            <p className="text-muted-foreground text-sm">
                                                {action.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 bg-sb-surface-2 ${action.gradient} text-white text-sm font-bold rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200 transform group-hover:scale-105`}>
                                        Go →
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
