'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/auth/client'
import { Brain, Clock, Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { AttentionAssessment } from '@/lib/attention/ScoringEngine'

interface FocusCheckCardProps {
  className?: string
}

export const FocusCheckCard: React.FC<FocusCheckCardProps> = ({ className = '' }) => {
  const { data: session } = useSession()
  const user = session?.user
  const router = useRouter()
  const [lastAssessment, setLastAssessment] = useState<AttentionAssessment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pomodoroRecommendation, setPomodoroRecommendation] = useState<number>(25)

  useEffect(() => {
    // Load last assessment from localStorage (in production, this would be from API)
    const loadLastAssessment = () => {
      try {
        const stored = localStorage.getItem(`focus_check_${user?.id}`)
        if (stored) {
          const assessment = JSON.parse(stored)
          setLastAssessment(assessment)

          // Calculate Pomodoro recommendation based on assessment
          if (assessment.sustainedPercentile) {
            if (assessment.sustainedPercentile < 25) {
              setPomodoroRecommendation(15)
            } else if (assessment.sustainedPercentile < 50) {
              setPomodoroRecommendation(20)
            } else if (assessment.sustainedPercentile > 75) {
              setPomodoroRecommendation(35)
            } else {
              setPomodoroRecommendation(25)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load last assessment:', error)
      }
    }

    if (user?.id) {
      loadLastAssessment()
    }
  }, [user?.id])

  const handleStartAssessment = async () => {
    setIsLoading(true)

    try {
      // Navigate to Mitram dashboard where assessment will be triggered
      router.push('/dashboard/user/mitram')
    } finally {
      setIsLoading(false)
    }
  }

  const formatLastTaken = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1)
  return 'Yesterday'
    if (diffDays < 7)
  return `${diffDays} days ago`
    if (diffDays < 30)
  return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const getScoreColor = (percentile: number) => {
    if (percentile >= 75)
  return 'text-sb-saffron-deep'
    if (percentile >= 50)
  return 'text-sb-sky-ink'
    if (percentile >= 25)
  return 'text-sb-butter-ink'
    return 'text-sb-rose-ink'
  }

  const getScoreLabel = (percentile: number) => {
    if (percentile >= 90)
  return 'Excellent'
    if (percentile >= 75)
  return 'Good'
    if (percentile >= 50)
  return 'Average'
    if (percentile >= 25)
  return 'Below Average'
    return 'Needs Attention'
  }

  return (
    <div className={`relative p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700 group overflow-hidden ${className}`}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-sb-surface-2   opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sb-navy   rounded-xl shadow-lg ">
            <Brain className="h-8 w-8 text-white" />
          </div>

          {lastAssessment && (
            <div className="flex items-center space-x-2">
              {lastAssessment.belowThreshold ? (
                <AlertCircle className="h-5 w-5 text-sb-butter-ink" />
              ) : (
                <CheckCircle className="h-5 w-5 text-sb-saffron-deep" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatLastTaken(lastAssessment.testDate.toString())}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            🎯 TEA-Ch² Focus Check
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Quick attention assessment to optimize your study sessions
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>10 minutes • Ages 5-15</span>
          </div>
        </div>

        {/* Results or First Time */}
        {lastAssessment ? (
          <div className="space-y-4 mb-6">
            {/* Score Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Latest Results</h4>
                <div className="text-right">
                  <div className="text-2xl font-bold text-sb-lav-ink">
                    {Math.round(lastAssessment.everydayIndex || 0)}
                  </div>
                  <div className="text-xs text-gray-500">Overall Score</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {lastAssessment.selectivePercentile && (
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(lastAssessment.selectivePercentile)}`}>
                      {lastAssessment.selectivePercentile}%ile
                    </div>
                    <div className="text-xs text-gray-500">Focus</div>
                  </div>
                )}

                {lastAssessment.sustainedPercentile && (
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(lastAssessment.sustainedPercentile)}`}>
                      {lastAssessment.sustainedPercentile}%ile
                    </div>
                    <div className="text-xs text-gray-500">Stamina</div>
                  </div>
                )}
              </div>
            </div>

            {/* Pomodoro Recommendation */}
            <div className="bg-sb-sky  rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-sb-sky-ink" />
                <h4 className="font-semibold text-sb-sky-ink ">
                  Your Optimal Study Session
                </h4>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-sb-sky-ink">
                  🍅 {pomodoroRecommendation} min
                </span>
                <div className="text-right">
                  <div className="text-sm text-sb-sky-ink ">
                    Personalized for you
                  </div>
                  <div className="text-xs text-sb-sky-ink">
                    Based on attention profile
                  </div>
                </div>
              </div>
            </div>

            {/* Alert if below threshold */}
            {lastAssessment.belowThreshold && (
              <div className="bg-sb-butter  rounded-xl p-4 border border-sb-butter ">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-sb-butter-ink mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sb-butter-ink  mb-1">
                      Attention Support Recommended
                    </h4>
                    <p className="text-sm text-sb-butter-ink ">
                      Your results suggest room for attention improvement. Consider attention training exercises.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 mb-6">
            <div className="w-16 h-16 bg-sb-surface-2   rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-sb-lav-ink" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Ready for Your First Focus Check?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get personalized study recommendations based on your attention profile!
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleStartAssessment}
          disabled={isLoading}
          className="w-full bg-sb-navy     text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div className="flex items-center justify-center space-x-2">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                <span>{lastAssessment ? 'Retake Focus Check' : 'Start Focus Check'}</span>
              </>
            )}
          </div>
        </button>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Based on validated TEA-Ch² assessment framework
          </p>
        </div>
      </div>
    </div>
  )
}
