/**
 * VG Kosh Quiz Review Component
 * Comprehensive review interface showing question-by-question breakdown
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  SpeakerWaveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

interface QuizReviewProps {
  quizData: any[]
  totalScore: number
  maxScore: number
  accuracy: number
  timeElapsed: number
  onClose: () => void
  onRetakeQuiz: () => void
}

export default function QuizReview({ 
  quizData, 
  totalScore, 
  maxScore, 
  accuracy, 
  timeElapsed,
  onClose, 
  onRetakeQuiz 
}: QuizReviewProps) {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [showExplanations, setShowExplanations] = useState(true)

  const currentReview = quizData[currentReviewIndex]
  const correctAnswers = quizData.filter(q => q.isCorrect).length
  const incorrectAnswers = quizData.length - correctAnswers

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAnswerStatusIcon = (isCorrect: boolean) => {
    return isCorrect ? (
      <CheckCircleIcon className="h-6 w-6 text-sb-saffron-deep" />
    ) : (
      <XCircleIcon className="h-6 w-6 text-sb-rose-ink" />
    )
  }

  const getAnswerStatusColor = (isCorrect: boolean) => {
    return isCorrect 
      ? 'bg-sb-saffron-tint border-sb-saffron text-sb-saffron-deep   '
      : 'bg-sb-rose border-sb-danger text-sb-rose-ink   '
  }

  const playPronunciation = (word: string) => {
    console.log(`Playing pronunciation for: ${word}`)
    // TODO: Implement audio playback
  }

  return (
    <div className="space-y-6">
      {/* Review Header */}
      <Card className="border-sb-sky bg-sb-surface-2     ">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sb-sky-ink ">
            <BookOpenIcon className="h-6 w-6" />
            <span>📚 Quiz Review - Detailed Analysis</span>
          </CardTitle>
          <CardDescription className="text-sb-sky-ink ">
            Review your answers and learn from explanations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-2xl font-bold text-sb-sky-ink">{totalScore}/{maxScore}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-2xl font-bold text-sb-saffron-deep">{correctAnswers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-2xl font-bold text-sb-rose-ink">{incorrectAnswers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Incorrect</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-2xl font-bold text-sb-lav-ink">{formatTime(timeElapsed)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Time Taken</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Overall Performance</span>
              <span>{accuracy}% Accuracy</span>
            </div>
            <Progress value={accuracy} className="h-3" />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentReviewIndex(Math.max(0, currentReviewIndex - 1))}
                disabled={currentReviewIndex === 0}
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentReviewIndex + 1} of {quizData.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentReviewIndex(Math.min(quizData.length - 1, currentReviewIndex + 1))}
                disabled={currentReviewIndex === quizData.length - 1}
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExplanations(!showExplanations)}
            >
              <LightBulbIcon className="h-4 w-4 mr-1" />
              {showExplanations ? 'Hide' : 'Show'} Explanations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      {currentReview && (
        <Card className={`border-2 ${getAnswerStatusColor(currentReview.isCorrect)}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                {getAnswerStatusIcon(currentReview.isCorrect)}
                <span>Question {currentReview.questionNumber}</span>
                <Badge variant={currentReview.isCorrect ? 'default' : 'destructive'}>
                  {currentReview.isCorrect ? 'Correct' : 'Incorrect'}
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => playPronunciation(currentReview.question.word)}
              >
                <SpeakerWaveIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {currentReview.question.questionText}
              </h3>
              
              {/* Options */}
              <div className="space-y-2">
                {currentReview.question.options.map((option: string, index: number) => {
                  const isUserAnswer = option === currentReview.userAnswer
                  const isCorrectAnswer = option === currentReview.question.correctAnswer
                  
                  let optionClass = 'p-3 rounded border '
                  if (isCorrectAnswer) {
                    optionClass += 'bg-sb-saffron-tint border-sb-saffron text-sb-saffron-deep   '
                  } else if (isUserAnswer && !isCorrectAnswer) {
                    optionClass += 'bg-sb-rose border-sb-danger text-sb-rose-ink   '
                  } else {
                    optionClass += 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                  }
                  
                  return (
                    <div key={index} className={optionClass}>
                      <div className="flex items-center justify-between">
                        <span>
                          <strong>{String.fromCharCode(65 + index)})</strong> {option}
                        </span>
                        <div className="flex items-center space-x-2">
                          {isCorrectAnswer && <CheckCircleIcon className="h-5 w-5 text-sb-saffron-deep" />}
                          {isUserAnswer && !isCorrectAnswer && <XCircleIcon className="h-5 w-5 text-sb-rose-ink" />}
                          {isUserAnswer && <Badge variant="outline">Your Answer</Badge>}
                          {isCorrectAnswer && <Badge variant="outline" className="bg-sb-saffron-tint text-sb-saffron-deep border-sb-saffron">Correct</Badge>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Explanation */}
            {showExplanations && (
              <div className="space-y-3">
                <div className="p-4 bg-sb-sky  rounded-lg border border-sb-sky ">
                  <h4 className="font-semibold text-sb-sky-ink  mb-2 flex items-center">
                    <LightBulbIcon className="h-5 w-5 mr-2" />
                    Explanation
                  </h4>
                  <p className="text-sb-sky-ink ">
                    {currentReview.question.explanation}
                  </p>
                </div>

                {/* Cultural Context */}
                {currentReview.question.culturalContext && (
                  <div className="p-4 bg-sb-saffron-tint  rounded-lg border border-sb-saffron ">
                    <h4 className="font-semibold text-sb-saffron-deep  mb-2">
                      🇮🇳 Cultural Context
                    </h4>
                    <p className="text-sb-saffron-deep ">
                      {currentReview.question.culturalContext}
                    </p>
                  </div>
                )}

                {/* Hindi Context */}
                {currentReview.question.hindiContext && (
                  <div className="p-4 bg-sb-saffron-tint  rounded-lg border border-sb-saffron ">
                    <h4 className="font-semibold text-sb-saffron-deep  mb-2">
                      🔤 Hindi Translation
                    </h4>
                    <p className="text-sb-saffron-deep ">
                      {currentReview.question.hindiContext}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button onClick={onClose} variant="outline">
          📚 Back to Dictionary
        </Button>
        <Button onClick={onRetakeQuiz} className="bg-sb-navy hover:bg-sb-navy">
          🔄 Retake Quiz
        </Button>
      </div>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {quizData.map((item, index) => (
              <Button
                key={index}
                variant={index === currentReviewIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentReviewIndex(index)}
                className={`relative ${item.isCorrect ? 'border-sb-saffron' : 'border-sb-danger'}`}
              >
                {index + 1}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                  item.isCorrect ? 'bg-sb-navy' : 'bg-sb-danger'
                }`} />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
