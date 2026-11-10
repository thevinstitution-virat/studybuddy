'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  BookOpen, 
  Calculator, 
  Users, 
  Settings,
  BarChart3,
  FileText,
  MessageSquare
} from 'lucide-react'
import { motion } from 'framer-motion'

interface MenuDashboardProps {
  userRole?: string
}

export default function MenuDashboard({ userRole = 'student' }: MenuDashboardProps) {
  const menuItems = [
    {
      id: 'ai-tutor',
      title: 'AI Tutor',
      description: 'Chat with your intelligent learning assistant',
      icon: Brain,
      href: '/dashboard/user/ai-tutor',
      gradient: ' ',
      featured: true
    },
    {
      id: 'study-materials',
      title: 'Study Materials',
      description: 'Access comprehensive learning resources',
      icon: BookOpen,
      href: '/dashboard/user/materials',
      gradient: ' ',
      featured: true
    },
    {
      id: 'dictionary',
      title: 'Shabdakosh',
      description: 'English-Hindi dictionary with cultural context',
      icon: FileText,
      href: '/dashboard/user/dictionary',
      gradient: ' '
    },
    {
      id: 'mitram',
      title: 'Mitram',
      description: 'Psychological assessment and wellness tools',
      icon: Users,
      href: '/dashboard/user/mitram',
      gradient: ' '
    },
    {
      id: 'productivity',
      title: 'Productivity Tools',
      description: 'Study utilities and time management',
      icon: Calculator,
      href: '/dashboard/user/productivity',
      gradient: ' '
    },
    {
      id: 'analytics',
      title: 'Progress Analytics',
      description: 'Track your learning progress and performance',
      icon: BarChart3,
      href: '/dashboard/user/analytics',
      gradient: ' '
    }
  ]

  return (
    <div className="min-h-screen bg-sb-surface-2    dark:from-gray-900  ">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-sb-saffron-deep     mb-4"
          >
            Learning Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            Choose your learning path and explore educational tools
          </motion.p>
          <Badge variant="secondary" className="mt-2 bg-sb-sky text-sb-sky-ink">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
          </Badge>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                {item.featured && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-sb-navy   text-white">
                      Featured
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-sb-surface-2 ${item.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-foreground group-hover:text-sb-sky-ink transition-colors">
                        {item.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <Button 
                    className={`w-full bg-sb-surface-2 ${item.gradient} hover:opacity-90 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 group-hover:shadow-lg`}
                    onClick={() => window.location.href = item.href}
                  >
                    Get Started
                    <MessageSquare className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>

                {/* Hover Effect Overlay */}
                <div className={`absolute inset-0 bg-sb-surface-2 ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-sb-navy   text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">6</div>
                  <div className="text-white">Learning Tools</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">AI</div>
                  <div className="text-white">Powered Assistance</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">24/7</div>
                  <div className="text-white">Available Support</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Need Help Getting Started?
              </h3>
              <p className="text-muted-foreground mb-4">
                Our AI Tutor is ready to guide you through your learning journey
              </p>
              <Button 
                variant="outline" 
                className="border-sb-sky text-sb-sky-ink hover:bg-sb-sky"
                onClick={() => window.location.href = '/dashboard/user/ai-tutor'}
              >
                <Brain className="h-4 w-4 mr-2" />
                Start with AI Tutor
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
