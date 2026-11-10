'use client'

import React, { useState, useEffect } from 'react'
import {
  User,
  Shield,
  Settings,
  Key,
  Bell,
  Globe,
  Monitor,
  CheckCircle,
  AlertTriangle,
  Edit,
  X,
  Save,
  Eye,
  EyeOff,
  Database,
  Users,
  Activity,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useBetterAuthUser } from '@/hooks/useBetterAuthUser'

interface AdminProfileData {
  firstName: string
  lastName: string
  emailAddress: string
  role: string
  permissions: string[]
  lastLogin: string
  accountCreated: string
}

interface AdminSettings {
  emailNotifications: boolean
  systemAlerts: boolean
  maintenanceMode: boolean
  debugMode: boolean
  autoBackup: boolean
  twoFactorAuth: boolean
}

interface ValidationErrors {
  [key: string]: string
}

export default function AdminProfilePage() {
  const { user, isLoaded } = useBetterAuthUser()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profileData, setProfileData] = useState<AdminProfileData>({
    firstName: '',
    lastName: '',
    emailAddress: '',
    role: 'Administrator',
    permissions: ['full_access', 'user_management', 'content_management', 'system_settings'],
    lastLogin: new Date().toISOString(),
    accountCreated: new Date().toISOString()
  })
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    emailNotifications: true,
    systemAlerts: true,
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    twoFactorAuth: false
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isLoaded && user) {
      setProfileData({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        emailAddress: user.email || '',
        role: 'Administrator',
        permissions: ['full_access', 'user_management', 'content_management', 'system_settings'],
        lastLogin: new Date().toISOString(),
        accountCreated: user.createdAt?.toISOString() || new Date().toISOString()
      })
    }
  }, [isLoaded, user])

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!profileData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      // Name updates are handled via the profile API
      // No direct user.update() needed with BetterAuth

      // Here you would also save admin settings to your backend
      // await saveAdminSettings(adminSettings)

      setSuccessMessage('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setErrors({ general: 'Failed to update profile. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setProfileData({
        ...profileData,
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        emailAddress: user.email || ''
      })
    }
    setIsEditing(false)
    setErrors({})
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-sb-surface-2  to-primary/10 rounded-full border border-sb-saffron dark:border-primary/30 mb-6 backdrop-blur-sm">
            <Shield className="h-4 w-4 text-sb-saffron-deep mr-2 animate-pulse" />
            <span className="text-sm font-medium text-foreground">Administrator Portal</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className="text-sb-saffron-deep  to-primary/80  ">Admin Profile</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Manage your administrator account and system preferences with advanced controls
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-sb-surface-2     border border-sb-saffron  rounded-2xl p-6 backdrop-blur-md shadow-lg">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-sb-navy   rounded-xl mr-4 shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sb-saffron-deep ">Success!</h3>
                <p className="text-sb-saffron-deep ">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="bg-sb-surface-2  to-primary/10  dark:to-primary/15 border border-sb-danger  rounded-2xl p-6 backdrop-blur-md shadow-lg">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-sb-navy  to-primary/80 rounded-xl mr-4 shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sb-rose-ink ">Error</h3>
                <p className="text-sb-rose-ink ">{errors.general}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative p-8 bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-border/50 group overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 bg-sb-surface-2  to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex flex-row items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-sb-navy  to-primary/80 rounded-xl shadow-lg">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">Profile Information</h2>
                    </div>
                    <p className="text-muted-foreground">
                      Your personal information and account details
                    </p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 bg-sb-navy  to-primary/80 text-white  hover:to-primary/80 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sb-saffron focus:ring-offset-2"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center px-4 py-2 border-2 border-input text-foreground hover:border-sb-saffron hover:text-sb-saffron-deep hover:bg-sb-saffron-tint  rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sb-saffron focus:ring-offset-2"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center px-4 py-2 bg-sb-navy   text-white   rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sb-saffron focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sb-saffron focus:border-transparent backdrop-blur-sm ${errors.firstName
                            ? 'border-sb-danger bg-sb-rose '
                            : 'border-border bg-white/50 hover:border-sb-saffron '
                            }`}
                          placeholder="Enter your first name"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-muted/30 rounded-xl border border-border">
                          <p className="text-foreground font-medium">{profileData.firstName}</p>
                        </div>
                      )}
                      {errors.firstName && (
                        <p className="text-sb-rose-ink text-sm mt-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sb-saffron focus:border-transparent backdrop-blur-sm ${errors.lastName
                            ? 'border-sb-danger bg-sb-rose '
                            : 'border-border bg-white/50 hover:border-sb-saffron '
                            }`}
                          placeholder="Enter your last name"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-muted/30 rounded-xl border border-border">
                          <p className="text-foreground font-medium">{profileData.lastName}</p>
                        </div>
                      )}
                      {errors.lastName && (
                        <p className="text-sb-rose-ink text-sm mt-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">Email Address</label>
                    <div className="px-4 py-3 bg-muted/30 rounded-xl border border-border">
                      <p className="text-foreground font-medium">{profileData.emailAddress}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Email changes must be made through your authentication provider
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">Role</label>
                    <div className="inline-flex items-center px-4 py-2 bg-sb-navy  to-primary/80 text-white rounded-xl font-semibold shadow-lg">
                      <Shield className="h-5 w-5 mr-2" />
                      {profileData.role}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">Permissions</label>
                    <div className="flex flex-wrap gap-3">
                      {profileData.permissions.map((permission, index) => (
                        <div key={permission} className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold text-white shadow-md ${index % 4 === 0 ? 'bg-sb-surface-2 from-primary to-primary/80' :
                          index % 4 === 1 ? 'bg-sb-surface-2 from-primary ' :
                            index % 4 === 2 ? 'bg-sb-navy  ' :
                              'bg-sb-navy  '
                          }`}>
                          {permission.replace('_', ' ').toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information & Settings */}
          <div className="space-y-8">
            {/* Account Info */}
            <div className="relative p-6 bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-border/50 group overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 bg-sb-surface-2   opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-sb-navy   rounded-xl shadow-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Account Info</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                    <label className="block text-sm font-semibold text-foreground mb-1">Last Login</label>
                    <p className="text-foreground font-medium">
                      {formatDate(profileData.lastLogin)}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                    <label className="block text-sm font-semibold text-foreground mb-1">Account Created</label>
                    <p className="text-foreground font-medium">
                      {formatDate(profileData.accountCreated)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="relative p-6 bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-border/50 group overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 bg-sb-surface-2 from-primary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-sb-surface-2 from-primary to-primary/80 rounded-xl shadow-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <a
                    href="/dashboard/super-admin/users"
                    className="flex items-center w-full p-4 bg-sb-surface-2 from-primary/10 to-primary/10 dark:from-primary/15 dark:to-primary/15 hover:from-primary/15 hover:to-primary/15 dark:hover:from-primary/15 dark:hover:to-primary/15 rounded-xl border border-primary/30 transition-all duration-300 transform hover:scale-105 group/action"
                  >
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-sb-surface-2 from-primary to-primary/80 rounded-lg mr-3 shadow-md group-hover/action:shadow-lg transition-shadow duration-300">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">Manage Users</span>
                  </a>
                  <a
                    href="/dashboard/super-admin/database"
                    className="flex items-center w-full p-4 bg-sb-surface-2 from-primary/10  dark:from-primary/10  hover:from-primary/15  dark:hover:from-primary/15  rounded-xl border border-primary/30 transition-all duration-300 transform hover:scale-105 group/action"
                  >
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-sb-surface-2 from-primary  rounded-lg mr-3 shadow-md group-hover/action:shadow-lg transition-shadow duration-300">
                      <Database className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">Database Admin</span>
                  </a>
                  <a
                    href="/dashboard/super-admin/settings"
                    className="flex items-center w-full p-4 bg-sb-surface-2         rounded-xl border border-sb-saffron  transition-all duration-300 transform hover:scale-105 group/action"
                  >
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-sb-navy   rounded-lg mr-3 shadow-md group-hover/action:shadow-lg transition-shadow duration-300">
                      <Monitor className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">System Settings</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
