/**
 * VG Kosh Functional Stats Cards
 * Real-time user statistics and progress tracking
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrophyIcon, 
  FireIcon, 
  BookOpenIcon, 
  StarIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  LanguageIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { useUserStats } from '@/hooks/useUserStats'

export default function StatsCards() {
  const { 
    stats, 
    isLoading, 
    getTodayProgress, 
    getStreakInfo, 
    getLevelInfo 
  } = useUserStats()

  const todayProgress = getTodayProgress()
  const streakInfo = getStreakInfo()
  const levelInfo = getLevelInfo()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today's Progress Card */}
      <Card className="border-sb-saffron bg-sb-surface-2     ">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sb-saffron-deep  flex items-center">
            <BookOpenIcon className="h-4 w-4 mr-2" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-sb-saffron-deep ">
                {todayProgress.wordsLearned}
              </span>
              <span className="text-sm text-sb-saffron-deep ">
                / {todayProgress.goal} words
              </span>
            </div>
            <Progress 
              value={todayProgress.percentage} 
              className="h-2 bg-sb-saffron-tint "
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-sb-saffron-deep ">
                {todayProgress.percentage.toFixed(0)}% complete
              </span>
              {todayProgress.remaining > 0 && (
                <span className="text-sb-saffron-deep ">
                  {todayProgress.remaining} to go
                </span>
              )}
              {todayProgress.percentage >= 100 && (
                <Badge variant="default" className="bg-sb-navy text-white">
                  Goal Achieved! 🎉
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Streak Card */}
      <Card className="border-sb-saffron bg-sb-surface-2     ">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sb-saffron-deep  flex items-center">
            <FireIcon className="h-4 w-4 mr-2" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-sb-saffron-deep ">
                {streakInfo.current}
              </span>
              <span className="text-sm text-sb-saffron-deep ">
                days
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-sb-saffron-deep ">
                Longest: {streakInfo.longest} days
              </span>
              {streakInfo.isOnTrack ? (
                <Badge variant="default" className="bg-sb-navy text-white">
                  On Track! 🔥
                </Badge>
              ) : (
                <Badge variant="outline" className="border-sb-saffron text-sb-saffron-deep">
                  Keep Going!
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level & Points Card */}
      <Card className="border-sb-lav bg-sb-surface-2     ">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sb-lav-ink  flex items-center">
            <StarIcon className="h-4 w-4 mr-2" />
            Level & Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-sb-lav-ink ">
                {levelInfo.current}
              </span>
              <span className="text-sm text-sb-lav-ink ">
                {levelInfo.totalPoints} pts
              </span>
            </div>
            <Progress 
              value={levelInfo.progress} 
              className="h-2 bg-sb-lav "
            />
            <div className="text-xs text-sb-lav-ink ">
              {levelInfo.pointsToNext} points to Level {levelInfo.current + 1}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Words Learned Card */}
      <Card className="border-sb-sky bg-sb-surface-2     ">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sb-sky-ink  flex items-center">
            <TrophyIcon className="h-4 w-4 mr-2" />
            Total Learned
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-sb-sky-ink ">
                {stats.totalWordsLearned}
              </span>
              <span className="text-sm text-sb-sky-ink ">
                words
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-sb-sky-ink ">
                Mastered: {stats.wordsMastered}
              </span>
              <Badge variant="outline" className="border-sb-sky text-sb-sky-ink">
                {((stats.wordsMastered / Math.max(1, stats.totalWordsLearned)) * 100).toFixed(0)}% mastery
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats Row */}
      <Card className="md:col-span-2 border-sb-lav bg-sb-surface-2     ">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sb-lav-ink  flex items-center">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Learning Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-sb-lav-ink ">
                {stats.todayWordsSearched}
              </div>
              <div className="text-xs text-sb-lav-ink ">
                Words Searched Today
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-sb-lav-ink ">
                {stats.todayQuizzesCompleted}
              </div>
              <div className="text-xs text-sb-lav-ink ">
                Quizzes Completed
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-sb-lav-ink ">
                {stats.culturalWordsLearned}
              </div>
              <div className="text-xs text-sb-lav-ink ">
                Cultural Words
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-sb-lav-ink ">
                {stats.hindiTranslationsViewed}
              </div>
              <div className="text-xs text-sb-lav-ink ">
                Hindi Translations
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card className="md:col-span-2 border-sb-saffron bg-sb-surface-2     ">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sb-saffron-deep  flex items-center">
            <AcademicCapIcon className="h-4 w-4 mr-2" />
            Learning Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sb-saffron-deep ">
                📅 Member since: {new Date(stats.joinDate).toLocaleDateString()}
              </span>
              <span className="text-sm text-sb-saffron-deep ">
                🎯 Achievements: {stats.achievements.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-sb-saffron-deep ">
                🇮🇳 Cultural focus: {((stats.culturalWordsLearned / Math.max(1, stats.totalWordsLearned)) * 100).toFixed(0)}%
              </span>
              <span className="text-sm text-sb-saffron-deep ">
                📈 Level progress: {levelInfo.progress.toFixed(0)}%
              </span>
            </div>
            {todayProgress.percentage >= 100 && (
              <div className="mt-2 p-2 bg-sb-saffron-tint  rounded-md">
                <span className="text-sm font-medium text-sb-saffron-deep ">
                  🎉 Congratulations! You've achieved your daily goal. Keep up the excellent work!
                </span>
              </div>
            )}
            {streakInfo.current >= 7 && (
              <div className="mt-2 p-2 bg-sb-saffron-tint  rounded-md">
                <span className="text-sm font-medium text-sb-saffron-deep ">
                  🔥 Amazing! You're on a {streakInfo.current}-day streak. You're building great learning habits!
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
