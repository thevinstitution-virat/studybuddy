'use client';

/**
 * Answer Action Buttons Component
 * Provides 4 specialized action buttons below AI Tutor answers:
 * 1. Translate Button (Globe icon - simple and universal)
 * 2. Word Meaning Button (BookOpenText icon - more educational)
 * 3. Generate Visual Learning Aid Button (ImagePlus icon - more specific)
 * 4. Add to Notes Button (BookmarkPlus icon - more specific for saving)
 *
 * These buttons ONLY appear after genuine AI-generated educational answers,
 * NOT after system messages, welcome greetings, or selection menus.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  BookOpenText,
  ImagePlus,
  FolderPlus,
  Plus,
  BookmarkPlus,
  Loader2,
  Volume2,
  FileText,
  Lightbulb,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNotification } from '@/lib/store';
import VisualizationRenderer from '@/components/ai/VisualizationRenderer';
import { markdownToHtml } from '@/lib/utils/markdownToHtml';
import { addNewPage } from '@/lib/utils/multiPageContent';

/**
 * user_notes.board is a strict MySQL ENUM('CBSE','ICSE','STATE_BOARD')
 * (src/db/schema.ts:487). The tutor session carries the board as the lowercase
 * EducationBoard union 'cbse' | 'icse' | 'state_board'
 * (src/app/dashboard/user/ai-tutor/_types/index.ts:105), so passing it straight
 * through would send 'cbse' and the INSERT would reject it.
 */
const NOTE_BOARD_ENUM = ['CBSE', 'ICSE', 'STATE_BOARD'] as const;
type NoteBoard = typeof NOTE_BOARD_ENUM[number];

/**
 * Normalise a board value to the DB enum, or return null when it cannot be
 * mapped. Callers must OMIT the field on null rather than sending a bad value —
 * an unmatched board should never fail the whole note save.
 */
function toNoteBoardEnum(board?: string | null): NoteBoard | null {
  if (!board) return null;
  const normalised = board.trim().toUpperCase().replace(/[\s-]+/g, '_');
  return (NOTE_BOARD_ENUM as readonly string[]).includes(normalised)
    ? (normalised as NoteBoard)
    : null;
}

interface AnswerActionButtonsProps {
  answer: string;
  query: string;
  currentMedium: 'ENGLISH' | 'HINDI';
  subject?: string;
  classLevel?: string;
  /**
   * Tutor session board. Accepts the lowercase EducationBoard values or the
   * uppercase DB enum; normalised via toNoteBoardEnum before saving. Supplied by
   * the ai-tutor page as conversationState.selectedBoard.
   */
  board?: string;
  /** Optional chapter for the current tutor session; persisted to user_notes.chapter. */
  chapter?: string;
  onVisualizationGenerated?: (visualization: any) => void;
  onButtonUsage?: (buttonType: 'translate' | 'word_meanings' | 'visual_aid' | 'add_to_sanchika' | 'explain_differently', metadata?: any) => void;
}

interface WordMeaning {
  word: string;
  pronunciation: string;
  meaning: string;
}

export default function AnswerActionButtons({
  answer,
  query,
  currentMedium,
  subject = 'general',
  classLevel = 'Class 10',
  board,
  chapter,
  onVisualizationGenerated,
  onButtonUsage
}: AnswerActionButtonsProps) {
  const { addNotification } = useNotification();

  // "Explain a different way" state
  const [isExplaining, setIsExplaining] = useState(false);
  const [altExplanation, setAltExplanation] = useState<string | null>(null);
  const [altAngleLabel, setAltAngleLabel] = useState<string | null>(null);
  const [showAltExplanation, setShowAltExplanation] = useState(false);
  const [angleIndex, setAngleIndex] = useState(0);

  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [wordMeanings, setWordMeanings] = useState<WordMeaning[]>([]);
  const [showWordMeanings, setShowWordMeanings] = useState(false);

  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [generatedVisualization, setGeneratedVisualization] = useState<any>(null);
  const [showVisualization, setShowVisualization] = useState(false);

  const [isSavingNote, setIsSavingNote] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Folder selection state
  const [folders, setFolders] = useState<Array<{ id: string; name: string; color?: string; icon?: string; isDefault?: boolean }>>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('deep_dive');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);

  // Existing notes state for append feature
  const [saveMode, setSaveMode] = useState<'new' | 'append'>('new');
  const [existingNotes, setExistingNotes] = useState<Array<{ id: string; title: string; subject?: string; updated_at: string }>>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // Fetch folders and notes when dialog opens
  useEffect(() => {
    if (showSaveDialog) {
      fetchFolders();
      fetchExistingNotes();
    }
  }, [showSaveDialog]);

  const fetchFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const response = await fetch('/api/notes/folders');
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const fetchExistingNotes = async () => {
    setIsLoadingNotes(true);
    try {
      const response = await fetch('/api/notes?limit=50');
      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped in { notes: [...] }
        const notesArray = Array.isArray(data) ? data : (data.notes || []);
        setExistingNotes(notesArray);
        console.log('📋 Fetched existing notes:', notesArray.length);
      }
    } catch (error) {
      console.error('Failed to fetch existing notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/notes/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setFolders(prev => [...prev, data.folder]);
        setSelectedFolderId(data.folder.id);
        setNewFolderName('');
        setIsCreatingFolder(false);
        addNotification({ type: 'success', title: 'Folder Created', message: `Folder "${data.folder.name}" created successfully.` });
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      addNotification({ type: 'error', title: 'Error', message: 'Failed to create folder.' });
    }
  };

  // Determine target language for translation based on user's enrolled medium
  const targetLanguage = currentMedium === 'ENGLISH' ? 'HINDI' : 'ENGLISH';

  // Translation header label (bilingual)
  const translationHeaderLabel = currentMedium === 'ENGLISH'
    ? 'Translation (Hindi - हिंदी)'
    : 'Translation (English - अंग्रेजी)';

  /**
   * Handle translation button click
   * Implements bidirectional translation with script mixing
   */
  const handleTranslate = async () => {
    if (translatedText) {
      setShowTranslation(!showTranslation);
      return;
    }

    setIsTranslating(true);

    // Track button usage
    if (onButtonUsage) {
      onButtonUsage('translate', {
        sourceLang: currentMedium,
        targetLang: targetLanguage,
        subject,
        classLevel,
        translationStrategy: currentMedium === 'ENGLISH' ? 'devanagari-mixed' : 'roman-mixed'
      });
    }

    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: answer,
          sourceLang: currentMedium,
          targetLang: targetLanguage,
          userMedium: currentMedium
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || `Translation failed (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
      setShowTranslation(true);

      addNotification({
        type: 'success',
        title: 'Translation Complete',
        message: `Content translated to ${targetLanguage === 'HINDI' ? 'Hindi' : 'English'}`
      });
    } catch (error) {
      console.error('Translation error:', error);
      addNotification({
        type: 'error',
        title: 'Translation Failed',
        message: error instanceof Error ? error.message : 'Please try again later.'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  /**
   * Handle word meanings button click
   */
  const handleWordMeanings = async () => {
    if (wordMeanings.length > 0) {
      setShowWordMeanings(!showWordMeanings);
      return;
    }

    setIsLoadingWords(true);

    // Track button usage
    if (onButtonUsage) {
      onButtonUsage('word_meanings', {
        subject,
        classLevel
      });
    }

    try {
      const response = await fetch('/api/ai/word-meanings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: answer,
          subject,
          classLevel
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || `Word meanings extraction failed (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setWordMeanings(data.words || []);
      setShowWordMeanings(true);

      if (data.words && data.words.length > 0) {
        addNotification({
          type: 'success',
          title: 'Word Meanings Extracted',
          message: `Found ${data.words.length} difficult words with definitions`
        });
      } else {
        addNotification({
          type: 'info',
          title: 'No Difficult Words Found',
          message: 'This content appears to use commonly understood vocabulary.'
        });
      }
    } catch (error) {
      console.error('Word meanings error:', error);
      addNotification({
        type: 'error',
        title: 'Word Meanings Failed',
        message: error instanceof Error ? error.message : 'Please try again later.'
      });
    } finally {
      setIsLoadingWords(false);
    }
  };

  /**
   * Handle visual learning aid generation with toggle behavior
   */
  const handleGenerateVisual = async () => {
    // If visualization already exists, just toggle visibility
    if (generatedVisualization) {
      setShowVisualization(!showVisualization);
      return;
    }

    setIsGeneratingVisual(true);

    // Track button usage
    if (onButtonUsage) {
      onButtonUsage('visual_aid', {
        subject,
        classLevel,
        query
      });
    }

    try {
      const response = await fetch('/api/ai/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          answer,
          subject,
          classLevel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Visual generation failed');
      }

      const data = await response.json();

      // Check if visualization was successfully generated
      if (data.success && data.visualization) {
        // Store visualization locally for toggle behavior
        setGeneratedVisualization(data.visualization);
        setShowVisualization(true);

        // Also notify parent component (for backward compatibility)
        if (onVisualizationGenerated) {
          onVisualizationGenerated(data.visualization);
        }

        // Show success notification
        addNotification({
          type: 'success',
          title: 'Visual Aid Generated',
          message: 'The visualization is displayed below.'
        });

        console.log('✅ Visual aid generated successfully!', data.visualization);
      } else {
        // No suitable visualization could be generated
        const message = data.message || 'No suitable visualization could be generated for this content.';

        addNotification({
          type: 'info',
          title: 'No Visualization Available',
          message: 'Visual aids work best for comparisons, processes, statistical data, historical events, and classifications.'
        });

        console.log('ℹ️ No visualization generated:', message);
      }
    } catch (error) {
      console.error('Visual generation error:', error);

      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate visual aid. Please try again.'
      });
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  /**
   * Handle "Explain Differently".
   *
   * Re-explains the SAME answer through a relatable Indian analogy via the
   * dedicated /api/ai/explain-differently endpoint. That endpoint is a pure
   * text-transform (single LLM call, no RAG / premise-validation / cache), so it
   * is fast and reliable — unlike the previous version, which POSTed a synthetic
   * "Re-explain this…" prompt back through /api/ai/chat and had to parse an SSE
   * stream. Each press asks for a fresh analogy from a different everyday-Indian
   * domain (via `attempt`), so "Another Way" genuinely differs.
   *
   * Self-contained by design: this component does not own the tutor message
   * list, so the alternative renders inline here (same pattern as Translate and
   * Visual Aid) rather than requiring a new callback from the parent page.
   */
  const handleExplainDifferently = async () => {
    // Already have one and it's hidden — just toggle it back into view.
    if (altExplanation && !showAltExplanation) {
      setShowAltExplanation(true);
      return;
    }

    setIsExplaining(true);

    if (onButtonUsage) {
      onButtonUsage('explain_differently', { subject, classLevel, query, attempt: angleIndex });
    }

    try {
      const response = await fetch('/api/ai/explain-differently', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          answer,
          subject,
          classLevel,
          medium: currentMedium === 'HINDI' ? 'HINDI' : 'ENGLISH',
          attempt: angleIndex,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Could not generate another explanation (${response.status})`);
      }

      const data = await response.json();
      const text: string = (data.explanation || '').trim();

      if (!text) {
        throw new Error('The tutor returned an empty explanation.');
      }

      setAltExplanation(text);
      setAltAngleLabel('Indian analogy');
      setShowAltExplanation(true);
      setAngleIndex((i) => i + 1);

      addNotification({
        type: 'success',
        title: 'Explained with an analogy',
        message: 'A relatable take is shown below. Press again for another analogy.'
      });
    } catch (error) {
      console.error('Explain-differently error:', error);
      addNotification({
        type: 'error',
        title: 'Could Not Re-explain',
        message: error instanceof Error ? error.message : 'Please try again later.'
      });
    } finally {
      setIsExplaining(false);
    }
  };

  /**
   * Handle add to notes button click
   */
  const handleAddToNotes = () => {
    // Track button usage
    if (onButtonUsage) {
      onButtonUsage('add_to_sanchika', {
        subject,
        classLevel,
        query
      });
    }

    // Generate default title from query
    const defaultTitle = query.substring(0, 100) || 'AI Tutor Answer';
    setNoteTitle(defaultTitle);
    setShowSaveDialog(true);
  };

  /**
   * Add tag
   */
  const handleAddTag = () => {
    if (!newTag.trim()) return;

    const tagToAdd = newTag.trim().toLowerCase();
    if (noteTags.includes(tagToAdd)) {
      addNotification({
        type: 'info',
        title: 'Tag Already Added',
        message: 'This tag has already been added.'
      });
      return;
    }

    setNoteTags([...noteTags, tagToAdd]);
    setNewTag('');
  };

  /**
   * Remove tag
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setNoteTags(noteTags.filter(t => t !== tagToRemove));
  };

  /**
   * Save note to database (new note or append to existing)
   */
  const handleSaveNote = async () => {
    // Validate based on save mode
    if (saveMode === 'new' && !noteTitle.trim()) {
      addNotification({
        type: 'error',
        title: 'Title Required',
        message: 'Please enter a note title before saving.'
      });
      return;
    }

    if (saveMode === 'append' && !selectedNoteId) {
      addNotification({
        type: 'error',
        title: 'Select a Note',
        message: 'Please select an existing note to append to.'
      });
      return;
    }

    setIsSavingNote(true);
    try {
      // Build enriched content with answer + generated aids
      let enrichedContent = answer;

      // Add translation if generated
      if (translatedText) {
        enrichedContent += `\n\n---\n\n## 🌐 Translation (${targetLanguage})\n\n${translatedText}`;
      }

      // Add word meanings if generated
      if (wordMeanings.length > 0) {
        enrichedContent += `\n\n---\n\n## 📚 Difficult Words & Meanings\n\n| Word | Pronunciation | Meaning |\n|------|---------------|---------|\n`;
        wordMeanings.forEach(w => {
          enrichedContent += `| ${w.word} | ${w.pronunciation} | ${w.meaning} |\n`;
        });
      }

      // Add visual aid if generated
      if (generatedVisualization) {
        enrichedContent += `\n\n---\n\n## 📊 Visual Learning Aid\n\n${generatedVisualization.content || ''}\n\n*${generatedVisualization.caption || 'Visual aid for better understanding'}*`;
      }

      // Convert markdown to HTML for proper rendering in Sanchika's RichTextEditor
      const htmlContent = markdownToHtml(enrichedContent);

      if (saveMode === 'append' && selectedNoteId) {
        // APPEND TO EXISTING NOTE - Creates a NEW PAGE at the end
        console.log('📝 [APPEND] Starting append to note:', selectedNoteId);
        console.log('📝 [APPEND] Original markdown content length:', enrichedContent.length);
        console.log('📝 [APPEND] HTML content length:', htmlContent.length);

        // Fetch existing note content first
        const getResponse = await fetch(`/api/notes/${selectedNoteId}`);
        if (!getResponse.ok) {
          throw new Error('Failed to fetch existing note');
        }
        const existingNote = await getResponse.json();

        const existingContent = existingNote.note?.content || '';
        console.log('📝 [APPEND] Existing note content length:', existingContent.length);

        // Use multi-page format to add a NEW PAGE with the AI content
        const updatedContent = addNewPage(existingContent, htmlContent, {
          addedFrom: 'ai_tutor',
        });
        console.log('📝 [APPEND] Updated content (multi-page format) length:', updatedContent.length);

        // Update the note
        const response = await fetch(`/api/notes/${selectedNoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: updatedContent
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('📝 [APPEND] PUT failed:', errorData);
          throw new Error(errorData.error || 'Failed to append to note');
        }

        const putResult = await response.json();
        console.log('📝 [APPEND] PUT successful:', putResult);

        const selectedNote = existingNotes.find(n => n.id === selectedNoteId);
        addNotification({
          type: 'success',
          title: 'New Page Added!',
          message: `Created new page in "${selectedNote?.title || 'note'}" with your AI Tutor answer.`
        });

      } else {
        // CREATE NEW NOTE
        // board is an ENUM — omit the key entirely when it can't be mapped,
        // rather than sending an invalid value that would fail the INSERT.
        const noteBoard = toNoteBoardEnum(board);

        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: noteTitle,
            content: htmlContent,
            subject,
            // user_notes.class_level is varchar(20), not an int — always a string.
            class_level: classLevel != null ? String(classLevel) : null,
            ...(chapter ? { chapter } : {}),
            ...(noteBoard ? { board: noteBoard } : {}),
            tags: noteTags,
            folder_id: selectedFolderId !== 'none' ? selectedFolderId : null,
            source_type: 'ai_tutor',
            source_query: query
            // NOTE: source_answer and source_visualizations are intentionally not
            // sent. Both columns exist (schema.ts:493-494) but the POST handler in
            // src/app/api/notes/route.ts does not destructure them from the body —
            // source_answer is hardcoded to `content` server-side (route.ts:115)
            // and source_visualizations is never written on create. Sending them
            // would be silently discarded; persisting them needs a change to that
            // route, which was outside this change's scope.
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to save note');
        }

        const data = await response.json();
        console.log('✅ Note saved successfully:', data.noteId);

        addNotification({
          type: 'success',
          title: 'Note Saved Successfully!',
          message: 'Your note has been saved to Sanchika. Navigate to "Sanchika - Notes" from the sidebar to view it.'
        });
      }

      // Reset dialog state
      setShowSaveDialog(false);
      setNoteTitle('');
      setNoteTags([]);
      setNewTag('');
      setSaveMode('new');
      setSelectedNoteId('');

    } catch (error) {
      console.error('❌ Save note error:', error);

      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save note. Please try again.'
      });
    } finally {
      setIsSavingNote(false);
    }
  };

  /**
   * Play audio for text using TTS
   */
  const playAudio = async (text: string, language: 'en' | 'hi') => {
    try {
      // Use Web Speech API for text-to-speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  return (
    <div className="mt-3 space-y-4">
      {/* Action Buttons Row - Enhanced with better icons and styling */}
      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        {/* Translate Button - Globe icon with simplified label */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleTranslate}
          disabled={isTranslating}
          className="flex items-center gap-2 bg-sb-surface-2     border-sb-lav      hover:border-sb-lav  transition-all duration-200 hover:shadow-md"
        >
          {isTranslating ? (
            <Loader2 className="h-4 w-4 animate-spin text-sb-lav-ink " />
          ) : (
            <Globe className="h-4 w-4 text-sb-lav-ink " />
          )}
          <span className="text-sb-lav-ink  font-medium">
            {translatedText ? 'Toggle Translation' : 'Translate'}
          </span>
        </Button>

        {/* Word Meanings Button - BookOpenText icon */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleWordMeanings}
          disabled={isLoadingWords}
          className="flex items-center gap-2 bg-sb-surface-2     border-sb-sky      hover:border-sb-sky  transition-all duration-200 hover:shadow-md"
        >
          {isLoadingWords ? (
            <Loader2 className="h-4 w-4 animate-spin text-sb-sky-ink " />
          ) : (
            <BookOpenText className="h-4 w-4 text-sb-sky-ink " />
          )}
          <span className="hidden sm:inline text-sb-sky-ink  font-medium">Word Meanings</span>
          <span className="sm:hidden text-sb-sky-ink  font-medium">Words</span>
        </Button>

        {/* Generate Visual Aid Button - ImagePlus icon with toggle behavior */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateVisual}
          disabled={isGeneratingVisual}
          className="flex items-center gap-2 bg-sb-surface-2     border-sb-saffron      hover:border-sb-saffron  transition-all duration-200 hover:shadow-md"
        >
          {isGeneratingVisual ? (
            <Loader2 className="h-4 w-4 animate-spin text-sb-saffron-deep " />
          ) : (
            <ImagePlus className="h-4 w-4 text-sb-saffron-deep " />
          )}
          <span className="hidden sm:inline text-sb-saffron-deep  font-medium">
            {generatedVisualization ? 'Toggle Visual Aid' : 'Visual Aid'}
          </span>
          <span className="sm:hidden text-sb-saffron-deep  font-medium">Visual</span>
        </Button>

        {/* Add to Sanchika Button - BookmarkPlus icon */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddToNotes}
          disabled={isSavingNote}
          className="flex items-center gap-2 bg-sb-surface-2     border-sb-saffron      hover:border-sb-saffron  transition-all duration-200 hover:shadow-md"
        >
          {isSavingNote ? (
            <Loader2 className="h-4 w-4 animate-spin text-sb-saffron-deep " />
          ) : (
            <BookmarkPlus className="h-4 w-4 text-sb-saffron-deep " />
          )}
          <span className="hidden sm:inline text-sb-saffron-deep  font-medium">Add to Sanchika</span>
          <span className="sm:hidden text-sb-saffron-deep  font-medium">Save</span>
        </Button>

        {/*
          Explain a Different Way.
          NOTE: the spec asked for this "next to Regenerate", but no Regenerate
          button exists anywhere in the tutor UI (searched src/components/ai and
          src/app/dashboard/user/ai-tutor). Placed at the end of the action row.
        */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExplainDifferently}
          disabled={isExplaining}
          title="Get the same concept explained from a different angle"
          className="flex items-center gap-2 bg-sb-surface-2     border-sb-rose      hover:border-sb-rose  transition-all duration-200 hover:shadow-md"
        >
          {isExplaining ? (
            <Loader2 className="h-4 w-4 animate-spin text-sb-rose-ink " />
          ) : (
            <Lightbulb className="h-4 w-4 text-sb-rose-ink " />
          )}
          <span className="hidden sm:inline text-sb-rose-ink  font-medium">
            {altExplanation ? 'Another Way' : 'Explain Differently'}
          </span>
          <span className="sm:hidden text-sb-rose-ink  font-medium">Differently</span>
        </Button>
      </div>

      {/* Alternative Explanation Display */}
      {showAltExplanation && altExplanation && (
        <div className="bg-sb-rose  border border-sb-rose  rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-sb-rose-ink ">
              💡 Another way to see it{altAngleLabel ? ` — ${altAngleLabel}` : ''}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAltExplanation(false)}
              className="h-8 w-8 p-0 hover:bg-sb-rose "
              title="Hide this explanation"
            >
              <X className="h-4 w-4 text-sb-rose-ink " />
            </Button>
          </div>
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {altExplanation}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Translation Display - Bidirectional with proper script support */}
      {showTranslation && translatedText && (
        <div className="bg-sb-lav  border border-sb-lav  rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-sb-lav-ink ">
              {translationHeaderLabel}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => playAudio(translatedText, targetLanguage === 'HINDI' ? 'hi' : 'en')}
              className="h-8 w-8 p-0 hover:bg-sb-lav "
              title="Listen to translation"
            >
              <Volume2 className="h-4 w-4 text-sb-lav-ink " />
            </Button>
          </div>
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {translatedText}
            </ReactMarkdown>
          </div>
          <div className="mt-3 pt-3 border-t border-sb-lav ">
            <p className="text-xs text-sb-lav-ink  italic">
              {currentMedium === 'ENGLISH'
                ? '💡 Technical terms are kept in English to help you learn vocabulary for exams. Difficult Hindi words show their English meaning in brackets for better comprehension.'
                : '💡 तकनीकी शब्द हिंदी में रखे गए हैं ताकि आप अपनी सांस्कृतिक विरासत को समझ सकें। कठिन अंग्रेजी शब्दों के हिंदी अर्थ कोष्ठक में दिए गए हैं।'}
            </p>
          </div>
        </div>
      )}

      {/* Word Meanings Table */}
      {showWordMeanings && wordMeanings.length > 0 && (
        <div className="bg-sb-sky border border-sb-sky rounded-lg p-4">
          <h4 className="text-sm font-semibold text-sb-sky-ink mb-3">Difficult Words & Meanings</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-sb-sky">
                  <th className="text-left p-2 font-semibold text-sb-sky-ink">Word (English)</th>
                  <th className="text-left p-2 font-semibold text-sb-sky-ink">Pronunciation (Devanagari)</th>
                  <th className="text-left p-2 font-semibold text-sb-sky-ink">Meaning (Hindi)</th>
                </tr>
              </thead>
              <tbody>
                {wordMeanings.map((item, index) => (
                  <tr key={index} className="border-b border-sb-sky hover:bg-sb-sky transition-colors">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.word}</span>
                        <button
                          onClick={() => playAudio(item.word, 'en')}
                          className="text-sb-sky-ink hover:text-sb-sky-ink"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span>{item.pronunciation}</span>
                        <button
                          onClick={() => playAudio(item.pronunciation, 'hi')}
                          className="text-sb-sky-ink hover:text-sb-sky-ink"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span>{item.meaning}</span>
                        <button
                          onClick={() => playAudio(item.meaning, 'hi')}
                          className="text-sb-sky-ink hover:text-sb-sky-ink"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visual Learning Aid Display */}
      {showVisualization && generatedVisualization && (
        <div className="bg-sb-saffron-tint  border border-sb-saffron  rounded-lg p-4">
          <VisualizationRenderer visualizations={[generatedVisualization]} />
        </div>
      )}

      {/* Save to Notes Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Sanchika (संचिका)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Save Mode Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setSaveMode('new')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all ${saveMode === 'new'
                  ? 'bg-sb-navy   text-white'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                  }`}
              >
                📝 Create New Note
              </button>
              <button
                onClick={() => setSaveMode('append')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all ${saveMode === 'append'
                  ? 'bg-sb-navy   text-white'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                  }`}
              >
                📎 Append to Existing
              </button>
            </div>

            {/* NEW NOTE MODE */}
            {saveMode === 'new' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Note Title
                </label>
                <Input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="w-full"
                />
              </div>
            )}

            {/* APPEND TO EXISTING NOTE MODE */}
            {saveMode === 'append' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Existing Note
                </label>
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-input rounded-md text-sm focus:ring-2 focus:ring-sb-sky focus:border-sb-sky"
                  disabled={isLoadingNotes}
                >
                  <option value="">-- Select a note --</option>
                  {existingNotes.map(note => (
                    <option key={note.id} value={note.id}>
                      {note.title} {note.subject ? `(${note.subject})` : ''}
                    </option>
                  ))}
                </select>
                {existingNotes.length === 0 && !isLoadingNotes && (
                  <p className="text-xs text-muted-foreground mt-1">No existing notes found. Create a new note instead.</p>
                )}
                {selectedNoteId && (
                  <div className="mt-2 p-2 bg-sb-sky  rounded-lg border border-sb-sky ">
                    <p className="text-xs text-sb-sky-ink ">
                      ✨ The AI answer will be added as a new section at the end of this note with a page separator.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Folder Selection - Only for new notes */}
            {saveMode === 'new' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Save to Folder
                </label>
                {isCreatingFolder ? (
                  <div className="flex gap-2">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="New folder name..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateFolder();
                        }
                      }}
                    />
                    <Button onClick={handleCreateFolder} size="sm" className="bg-sb-navy hover:bg-sb-navy">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => setIsCreatingFolder(false)} variant="outline" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={selectedFolderId}
                      onChange={(e) => setSelectedFolderId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-card border border-input rounded-md text-sm focus:ring-2 focus:ring-sb-sky focus:border-sb-sky"
                      disabled={isLoadingFolders}
                    >
                      <option value="none">-- No folder --</option>
                      {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={() => setIsCreatingFolder(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <FolderPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">New</span>
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Organize your notes by agent type or create custom folders
                </p>
              </div>
            )}

            {/* Included Content Indicators */}
            {(translatedText || wordMeanings.length > 0 || generatedVisualization) && (
              <div className="bg-sb-sky  border border-sb-sky  rounded-lg p-3">
                <p className="text-xs font-medium text-sb-sky-ink  mb-2">✨ Will also save:</p>
                <div className="flex flex-wrap gap-2">
                  {translatedText && (
                    <Badge className="bg-sb-lav text-sb-lav-ink  ">
                      🌐 Translation
                    </Badge>
                  )}
                  {wordMeanings.length > 0 && (
                    <Badge className="bg-sb-sky text-sb-sky-ink  ">
                      📚 Word Meanings ({wordMeanings.length})
                    </Badge>
                  )}
                  {generatedVisualization && (
                    <Badge className="bg-sb-saffron-tint text-sb-saffron-deep  ">
                      📊 Visual Aid
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Tags Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Tags (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type a tag and press Enter..."
                  className="flex-1"
                />
                <Button onClick={handleAddTag} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              {noteTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {noteTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-sb-rose-ink"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-muted/40 p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Preview:</p>
              <p className="text-sm text-foreground line-clamp-3">
                {answer.substring(0, 150)}...
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setNoteTitle('');
                  setNoteTags([]);
                  setNewTag('');
                  setSaveMode('new');
                  setSelectedNoteId('');
                }}
                disabled={isSavingNote}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNote}
                disabled={isSavingNote || (saveMode === 'new' ? !noteTitle.trim() : !selectedNoteId)}
                className="bg-sb-navy    "
              >
                {isSavingNote ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {saveMode === 'append' ? 'Appending...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    {saveMode === 'append' ? 'Append to Note' : 'Save to Sanchika'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

