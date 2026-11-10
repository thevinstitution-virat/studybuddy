/**
 * Enhanced Word Display Component
 * Shows comprehensive word information in a beautiful, educational format
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  SpeakerWaveIcon, 
  BookOpenIcon, 
  GlobeAltIcon,
  AcademicCapIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

interface EnhancedWordData {
  word: string
  pronunciation: {
    ipa: string
    audio?: string
    syllables: string[]
    syllableCount: number
  }
  meanings: {
    partOfSpeech: string
    definition: string
    example?: string
  }[]
  translations: {
    hindi: string
    romanized: string
    alternates: string[]
  }
  synonyms: {
    english: string[]
    hindi: string[]
  }
  antonyms: {
    english: string[]
    hindi: string[]
  }
  indianContext: {
    explanation: string
    examples: string[]
    culturalNotes: string
  }
  frequency?: string
  difficulty?: string
}

interface EnhancedWordDisplayProps {
  wordData: EnhancedWordData
  onAddToFavorites?: () => void
  isFavorite?: boolean
}

export default function EnhancedWordDisplay({ 
  wordData, 
  onAddToFavorites, 
  isFavorite = false 
}: EnhancedWordDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const playPronunciation = async () => {
    if (wordData.pronunciation.audio) {
      setIsPlaying(true)
      try {
        const audio = new Audio(wordData.pronunciation.audio)
        audio.onended = () => setIsPlaying(false)
        await audio.play()
      } catch (error) {
        console.error('Audio playback failed:', error)
        setIsPlaying(false)
      }
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-sb-saffron-tint text-sb-saffron-deep border-sb-saffron'
      case 'medium': return 'bg-sb-butter text-sb-butter-ink border-sb-butter'
      case 'hard': return 'bg-sb-rose text-sb-rose-ink border-sb-danger'
      default: return 'bg-muted text-foreground border-input'
    }
  }

  return (
    <div className="space-y-6">
      {/* Word Header */}
      <Card className="border-sb-sky bg-sb-surface-2     ">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-4xl font-bold text-sb-sky-ink ">
                  {wordData.word}
                </h1>
                <div className="flex items-center space-x-2">
                  {wordData.pronunciation.audio && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={playPronunciation}
                      disabled={isPlaying}
                      className="border-sb-sky text-sb-sky-ink hover:bg-sb-sky"
                    >
                      <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                      {isPlaying ? 'Playing...' : '🔊'}
                    </Button>
                  )}
                  {onAddToFavorites && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddToFavorites}
                      className={isFavorite ? 'bg-sb-rose border-sb-danger text-sb-rose-ink' : 'border-input'}
                    >
                      <HeartIcon className={`h-4 w-4 mr-1 ${isFavorite ? 'fill-sb-rose-ink' : ''}`} />
                      {isFavorite ? 'Favorited' : 'Add to Favorites'}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-lg text-sb-sky-ink  font-mono">
                  {wordData.pronunciation.ipa}
                </span>
                <span className="text-sb-sky-ink ">
                  ({wordData.pronunciation.syllables.join('-')})
                </span>
                <Badge className={getDifficultyColor(wordData.difficulty || 'medium')}>
                  {wordData.difficulty || 'medium'} • {wordData.frequency || 'common'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hindi Translation */}
      <Card className="border-sb-saffron bg-sb-saffron-tint  ">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sb-saffron-deep ">
            <GlobeAltIcon className="h-5 w-5" />
            <span>🇭🇮 Hindi Translation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold text-sb-saffron-deep ">
              {wordData.translations.hindi}
            </div>
            {wordData.translations.romanized && (
              <div className="text-lg text-sb-saffron-deep  font-mono">
                ({wordData.translations.romanized})
              </div>
            )}
            {wordData.translations.alternates.length > 0 && (
              <div>
                <span className="text-sm font-medium text-sb-saffron-deep ">Other translations: </span>
                <span className="text-sb-saffron-deep ">
                  {wordData.translations.alternates.join(', ')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meanings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpenIcon className="h-5 w-5" />
            <span>📝 Meanings & Definitions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {wordData.meanings.map((meaning, index) => (
              <div key={index} className="border-l-4 border-sb-sky pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="text-sb-sky-ink border-sb-sky">
                    {meaning.partOfSpeech}
                  </Badge>
                </div>
                <p className="text-foreground mb-2">
                  {meaning.definition}
                </p>
                {meaning.example && (
                  <p className="text-sm text-muted-foreground italic">
                    Example: "{meaning.example}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Indian Context */}
      <Card className="border-sb-saffron bg-sb-saffron-tint  ">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sb-saffron-deep ">
            <AcademicCapIcon className="h-5 w-5" />
            <span>🇮🇳 Indian Context & Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sb-saffron-deep  mb-2">Explanation:</h4>
            <p className="text-sb-saffron-deep ">
              {wordData.indianContext.explanation}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sb-saffron-deep  mb-2">Examples in Indian Context:</h4>
            <div className="space-y-2">
              {wordData.indianContext.examples.map((example, index) => (
                <div key={index} className="bg-card p-3 rounded-lg border border-sb-saffron ">
                  <p className="text-foreground">
                    {index + 1}. {example}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sb-saffron-tint  p-3 rounded-lg">
            <h4 className="font-semibold text-sb-saffron-deep  mb-1">💡 Cultural Note:</h4>
            <p className="text-sb-saffron-deep  text-sm">
              {wordData.indianContext.culturalNotes}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Synonyms & Antonyms */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Synonyms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sb-sky-ink ">
              <SparklesIcon className="h-5 w-5" />
              <span>🔄 Synonyms</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wordData.synonyms.english.length > 0 && (
                <div>
                  <h5 className="font-medium text-foreground mb-2">English:</h5>
                  <div className="flex flex-wrap gap-2">
                    {wordData.synonyms.english.map((synonym, index) => (
                      <Badge key={index} variant="outline" className="text-sb-sky-ink border-sb-sky">
                        {synonym}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {wordData.synonyms.hindi.length > 0 && (
                <div>
                  <h5 className="font-medium text-foreground mb-2">Hindi:</h5>
                  <div className="flex flex-wrap gap-2">
                    {wordData.synonyms.hindi.map((synonym, index) => (
                      <Badge key={index} variant="outline" className="text-sb-saffron-deep border-sb-saffron">
                        {synonym}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Antonyms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sb-rose-ink ">
              <SparklesIcon className="h-5 w-5" />
              <span>⚡ Antonyms</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wordData.antonyms.english.length > 0 && (
                <div>
                  <h5 className="font-medium text-foreground mb-2">English:</h5>
                  <div className="flex flex-wrap gap-2">
                    {wordData.antonyms.english.map((antonym, index) => (
                      <Badge key={index} variant="outline" className="text-sb-rose-ink border-sb-danger">
                        {antonym}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {wordData.antonyms.hindi.length > 0 && (
                <div>
                  <h5 className="font-medium text-foreground mb-2">Hindi:</h5>
                  <div className="flex flex-wrap gap-2">
                    {wordData.antonyms.hindi.map((antonym, index) => (
                      <Badge key={index} variant="outline" className="text-sb-rose-ink border-sb-danger">
                        {antonym}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
