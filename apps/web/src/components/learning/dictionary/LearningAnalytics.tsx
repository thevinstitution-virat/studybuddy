/**
 * Learning Analytics Component
 * Phase 2 Feature 5: Advanced analytics and learning insights
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Badge } from '@/components/core/ui/badge'
import { Progress } from '@/components/core/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/core/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar, 
  Clock, 
  Award,
  Brain,
  Zap,
  BookOpen,
  Star,
  Activity,
  PieChart,
  LineChart,
  Users,
  Globe,
  Volume2,
  Heart,
  RefreshCw
} from 'lucide-react'
import { useDictionaryCache } from '@/hooks/useDictionaryCache'
import { useFavoriteWords } from '@/hooks/useFavoriteWords'
import { useUserStats } from '@/hooks/useUserStats'

interface LearningAnalyticsProps {
  className?: string
}

interface LearningInsight {
  type: 'achievement' | 'suggestion' | 'milestone' | 'warning'
  title: string
  description: string
  icon: React.ReactNode
  action?: string
}

export default function LearningAnalytics({ className = '' }: LearningAnalyticsProps) {
  const { cacheStats, getRecentSearches, getMostSearchedWords } = useDictionaryCache()
  const { learningProgress, favoriteWords, getFavoriteStats } = useFavoriteWords()
  const { stats } = useUserStats()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week')
  const [refreshing, setRefreshing] = useState(false)

  const favoriteStats = getFavoriteStats()
  const recentSearches = getRecentSearches(50)
  const mostSearched = getMostSearchedWords(20)

  // Calculate learning insights
  const learningInsights = useMemo((): LearningInsight[] => {
    const insights: LearningInsight[] = []

    // Achievement insights
    if (learningProgress.masteredWords >= 10) {
      insights.push({
        type: 'achievement',
        title: 'Vocabulary Master!',
        description: `You've mastered ${learningProgress.masteredWords} words. Keep up the excellent work!`,
        icon: <Award className="h-5 w-5 text-sb-butter-ink" />,
        action: 'View mastered words'
      })
    }

    if (learningProgress.streakDays >= 7) {
      insights.push({
        type: 'achievement',
        title: 'Week Streak!',
        description: `${learningProgress.streakDays} days of consistent learning. You're on fire!`,
        icon: <Zap className="h-5 w-5 text-sb-saffron-deep" />,
        action: 'Keep the streak going'
      })
    }

    // Suggestion insights
    if (favoriteStats.needsReview.length > 5) {
      insights.push({
        type: 'suggestion',
        title: 'Review Time',
        description: `${favoriteStats.needsReview.length} words need review to improve retention.`,
        icon: <RefreshCw className="h-5 w-5 text-sb-sky-ink" />,
        action: 'Start reviewing'
      })
    }

    if (learningProgress.weeklyProgress < learningProgress.weeklyGoal * 0.5) {
      insights.push({
        type: 'suggestion',
        title: 'Weekly Goal',
        description: `You're ${learningProgress.weeklyGoal - learningProgress.weeklyProgress} words behind your weekly goal.`,
        icon: <Target className="h-5 w-5 text-sb-lav-ink" />,
        action: 'Study more words'
      })
    }

    // Milestone insights
    if (stats.totalWordsLearned >= 100) {
      insights.push({
        type: 'milestone',
        title: 'Century Club!',
        description: `You've learned ${stats.totalWordsLearned} words total. Amazing progress!`,
        icon: <Brain className="h-5 w-5 text-sb-saffron-deep" />,
        action: 'Celebrate achievement'
      })
    }

    return insights
  }, [learningProgress, favoriteStats, stats])

  // Calculate learning patterns
  const learningPatterns = useMemo(() => {
    const patterns = {
      mostActiveHour: 'Morning',
      preferredDifficulty: 'Medium',
      averageSessionLength: '15 minutes',
      strongestCategory: 'Academic',
      improvementArea: 'Pronunciation'
    }

    // Analyze search patterns
    const hourCounts = new Array(24).fill(0)
    recentSearches.forEach(search => {
      const hour = new Date(search.timestamp).getHours()
      hourCounts[hour]++
    })

    const mostActiveHourIndex = hourCounts.indexOf(Math.max(...hourCounts))
    if (mostActiveHourIndex < 6) patterns.mostActiveHour = 'Early Morning'
    else if (mostActiveHourIndex < 12) patterns.mostActiveHour = 'Morning'
    else if (mostActiveHourIndex < 18) patterns.mostActiveHour = 'Afternoon'
    else patterns.mostActiveHour = 'Evening'

    // Analyze difficulty preferences
    const difficultyCount = favoriteWords.reduce((acc, word) => {
      const level = word.difficultyLevel || 'medium'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topDifficulty = Object.entries(difficultyCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0]
    if (topDifficulty) {
      patterns.preferredDifficulty = topDifficulty.charAt(0).toUpperCase() + topDifficulty.slice(1)
    }

    return patterns
  }, [recentSearches, favoriteWords])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const getInsightColor = (type: LearningInsight['type']) => {
    switch (type) {
      case 'achievement': return 'border-l-yellow-500 bg-sb-butter '
      case 'suggestion': return 'border-l-blue-500 bg-sb-sky '
      case 'milestone': return 'border-l-green-500 bg-sb-saffron-tint '
      case 'warning': return 'border-l-red-500 bg-sb-rose '
      default: return 'border-l-gray-500 bg-background/20'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Header */}
      <Card className="bg-sb-surface-2     border-sb-lav ">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-sb-lav-ink" />
                <span className="text-sb-saffron-deep    ">
                  Learning Analytics
                </span>
              </CardTitle>
              <CardDescription>
                Insights into your vocabulary learning journey
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-sb-lav-ink ">
                {stats.totalWordsLearned}
              </div>
              <div className="text-sm text-muted-foreground">Words Learned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sb-lav-ink ">
                {learningProgress.streakDays}
              </div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sb-sky-ink ">
                {cacheStats.cacheHitRate}%
              </div>
              <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sb-saffron-deep ">
                {Math.round((learningProgress.weeklyProgress / learningProgress.weeklyGoal) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Weekly Goal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Insights */}
      {learningInsights.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-sb-saffron-deep" />
              <span>Learning Insights</span>
              <Badge variant="secondary">{learningInsights.length}</Badge>
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your learning patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {learningInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-4 rounded-lg ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    {insight.icon}
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <Button variant="outline" size="sm" className="text-xs">
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-sb-saffron-deep" />
                <span>Learning Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mastery Distribution */}
              <div>
                <h4 className="font-medium mb-3">Vocabulary Mastery</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Learning</span>
                    <span className="text-sm font-medium">{learningProgress.learningWords}</span>
                  </div>
                  <Progress value={(learningProgress.learningWords / learningProgress.totalWords) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Familiar</span>
                    <span className="text-sm font-medium">{learningProgress.familiarWords}</span>
                  </div>
                  <Progress value={(learningProgress.familiarWords / learningProgress.totalWords) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mastered</span>
                    <span className="text-sm font-medium">{learningProgress.masteredWords}</span>
                  </div>
                  <Progress value={(learningProgress.masteredWords / learningProgress.totalWords) * 100} className="h-2" />
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="font-medium mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {favoriteStats.recentlyAdded.slice(0, 5).map((word, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/40 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-sb-sky-ink" />
                        <span className="font-medium">{word.word}</span>
                        <Badge variant="outline" className="text-xs">
                          {word.masteryLevel}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(word.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-sb-sky-ink" />
                <span>Learning Patterns</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-sb-sky  rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-sb-sky-ink" />
                      <span className="font-medium">Most Active Time</span>
                    </div>
                    <p className="text-2xl font-bold text-sb-sky-ink ">
                      {learningPatterns.mostActiveHour}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-sb-saffron-tint  rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-sb-saffron-deep" />
                      <span className="font-medium">Preferred Difficulty</span>
                    </div>
                    <p className="text-2xl font-bold text-sb-saffron-deep ">
                      {learningPatterns.preferredDifficulty}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-sb-lav  rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-4 w-4 text-sb-lav-ink" />
                      <span className="font-medium">Strongest Category</span>
                    </div>
                    <p className="text-2xl font-bold text-sb-lav-ink ">
                      {learningPatterns.strongestCategory}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-sb-saffron-tint  rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-sb-saffron-deep" />
                      <span className="font-medium">Improvement Area</span>
                    </div>
                    <p className="text-2xl font-bold text-sb-saffron-deep ">
                      {learningPatterns.improvementArea}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-sb-butter-ink" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-sb-surface-2     rounded-lg">
                  <div className="text-3xl font-bold text-sb-butter-ink  mb-2">
                    {cacheStats.totalSearchHistory}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Searches</div>
                </div>
                
                <div className="text-center p-4 bg-sb-surface-2     rounded-lg">
                  <div className="text-3xl font-bold text-sb-saffron-deep  mb-2">
                    {learningProgress.totalReviews}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Reviews</div>
                </div>
                
                <div className="text-center p-4 bg-sb-surface-2     rounded-lg">
                  <div className="text-3xl font-bold text-sb-sky-ink  mb-2">
                    {Math.round(learningProgress.averageAccuracy)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-sb-lav-ink" />
                <span>Learning Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weekly Goal Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Weekly Goal Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {learningProgress.weeklyProgress} / {learningProgress.weeklyGoal} words
                  </span>
                </div>
                <Progress 
                  value={(learningProgress.weeklyProgress / learningProgress.weeklyGoal) * 100} 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>{learningProgress.weeklyGoal} words</span>
                </div>
              </div>

              {/* Goal Suggestions */}
              <div>
                <h4 className="font-medium mb-3">Suggested Goals</h4>
                <div className="space-y-3">
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">Master 5 more words</span>
                        <p className="text-sm text-muted-foreground">
                          Review your familiar words to reach mastery
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Set Goal</Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">Maintain 14-day streak</span>
                        <p className="text-sm text-muted-foreground">
                          Double your current streak for consistent learning
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Set Goal</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
