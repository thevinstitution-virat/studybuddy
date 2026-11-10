'use client'

import { useState } from 'react'
import {
  Database,
  RefreshCw,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import useSWR from 'swr'

interface UploadedBook {
  id: string
  book_title: string
  subject: string
  class: string
  board: string
  medium: string
  total_pages: number
  total_chunks: number
  chapters_count: number
  status: 'complete' | 'in_progress' | 'failed'
  upload_date: string
  processing_time?: string
  estimated_size: string
  chapters: string[]
}

interface ContentOverviewProps {
  isActive?: boolean
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ContentOverview({ isActive = true }: ContentOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const booksPerPage = 10

  // Use SWR for real-time data fetching with auto-refresh
  const { data: booksData, error: booksError, isLoading: booksLoading, mutate: mutateBooks } = useSWR(
    isActive ? '/api/super-admin/qdrant/books' : null,
    fetcher,
    {
      refreshInterval: 10000, // Auto-refresh every 10 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  )

  const { data: statsData, error: statsError, isLoading: statsLoading, mutate: mutateStats } = useSWR(
    isActive ? '/api/super-admin/qdrant/stats' : null,
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  )

  // Transform API data to match UploadedBook interface
  const uploadedBooks: UploadedBook[] = booksData?.books?.map((book: any) => ({
    id: book.bookId,
    book_title: book.bookTitle,
    subject: book.subject,
    class: book.classLevel,
    board: book.curriculum,
    medium: book.language,
    total_pages: book.totalPages,
    total_chunks: book.totalChunks,
    chapters_count: 0, // Not available in API response
    status: 'complete' as const,
    upload_date: book.uploadDate || new Date().toISOString(),
    estimated_size: `${(book.totalChunks * 0.5).toFixed(1)} KB`,
    chapters: []
  })) || []

  const stats = statsData?.stats || null

  // Handle book actions
  const handleViewBook = (bookId: string) => {
    // Open Qdrant collection viewer or detailed view
    window.open(`http://localhost:6333/collections/ncert-books-enhanced`, '_blank')
  }

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    if (confirm(`Are you sure you want to delete "${bookTitle}"?\n\nThis action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/super-admin/qdrant/books/${bookId}`, {
          method: 'DELETE'
        })
        const result = await response.json()
        if (result.success) {
          mutateBooks() // Refresh the list using SWR
          mutateStats() // Refresh stats
          alert(`Successfully deleted "${bookTitle}" (${result.deletedCount} chunks)`)
        } else {
          alert('Failed to delete book: ' + (result.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting book:', error)
        alert('Error deleting book')
      }
    }
  }

  const handleRefresh = () => {
    mutateBooks()
    mutateStats()
  }

  // Filter and paginate books
  const filteredBooks = uploadedBooks.filter(book =>
    book.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.board.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.medium.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage)
  const startIndex = (currentPage - 1) * booksPerPage
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage)

  // Don't render anything if not active
  if (!isActive) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-sb-navy   rounded-2xl flex items-center justify-center shadow-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-sb-saffron-deep    ">
                Uploaded Content Overview
              </h2>
              <p className="text-muted-foreground">
                Manage and monitor all uploaded textbooks
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={booksLoading}
            className="px-4 py-2 bg-sb-navy   text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${booksLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search books by title, subject, or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted/40 border border-border rounded-xl focus:ring-2 focus:ring-sb-sky focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {booksLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-sb-sky-ink mb-4" />
            <p className="text-muted-foreground">Loading uploaded books...</p>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2">Auto-refreshing every 10 seconds...</p>
          </div>
        ) : booksError ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-sb-rose-ink mb-4" />
            <p className="text-sb-rose-ink ">Failed to load books</p>
            <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-sb-navy text-white rounded-lg hover:bg-sb-navy">
              Retry
            </button>
          </div>
        ) : paginatedBooks.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Books Found</h3>
            <p className="text-muted-foreground dark:text-muted-foreground">
              {searchTerm ? 'No books match your search criteria.' : 'Upload your first textbook to get started.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Book Details</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Content Stats</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Chapters</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Upload Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-600">
                  {paginatedBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-muted/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-foreground">{book.book_title}</div>
                          <div className="text-sm text-muted-foreground">
                            {book.subject} • Class {book.class} • {book.board} • {book.medium}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Pages:</span>
                            <span className="font-medium">{book.total_pages}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Chunks:</span>
                            <span className="font-medium">{book.total_chunks}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Size:</span>
                            <span className="font-medium">{book.estimated_size}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-sb-sky text-sb-sky-ink  ">
                            {book.chapters_count} chapters
                          </span>
                          {book.status === 'complete' && <CheckCircle className="h-4 w-4 text-sb-saffron-deep" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(book.upload_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewBook(book.id)}
                            className="p-2 text-sb-sky-ink hover:text-sb-sky-ink hover:bg-sb-sky  rounded-lg transition-colors duration-200"
                            title="View in Qdrant"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id, book.book_title)}
                            className="p-2 text-sb-rose-ink hover:text-sb-rose-ink hover:bg-sb-rose  rounded-lg transition-colors duration-200"
                            title="Delete Book"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-muted/40 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + booksPerPage, filteredBooks.length)} of {filteredBooks.length} books
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-foreground">
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
