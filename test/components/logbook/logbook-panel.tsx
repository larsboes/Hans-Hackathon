'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { LogbookEntryCard } from '@/components/logbook/logbook-entry'
import type { LogbookEntry } from '@/lib/types'
import {
  BookOpen,
  Plus,
  X,
  Clock,
  Users,
  Armchair,
  UtensilsCrossed,
  Star,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LogbookPanelProps {
  flightId: string
}

const CATEGORIES = [
  { id: 'delay' as const, label: 'Delay', icon: Clock, color: 'text-destructive' },
  { id: 'crew' as const, label: 'Crew', icon: Users, color: 'text-chart-2' },
  { id: 'seat' as const, label: 'Seat', icon: Armchair, color: 'text-chart-4' },
  { id: 'food' as const, label: 'Food', icon: UtensilsCrossed, color: 'text-chart-5' },
  { id: 'experience' as const, label: 'Experience', icon: Star, color: 'text-primary' },
  { id: 'other' as const, label: 'Other', icon: MessageCircle, color: 'text-muted-foreground' },
]

export function LogbookPanel({ flightId }: LogbookPanelProps) {
  const [entries, setEntries] = useState<LogbookEntry[]>([
    {
      id: 'demo-1',
      flightId,
      category: 'experience',
      content: 'Beautiful sunrise over the Atlantic! The sky turned pink and gold.',
      mood: 5,
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-2',
      flightId,
      category: 'crew',
      content: 'The flight attendant was incredibly kind, brought me an extra blanket without asking.',
      mood: 5,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-3',
      flightId,
      category: 'seat',
      content: 'Window seat 14A - great view and good legroom for economy.',
      mood: 4,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ])
  const [showForm, setShowForm] = useState(false)
  const [formCategory, setFormCategory] = useState<LogbookEntry['category']>('experience')
  const [formContent, setFormContent] = useState('')
  const [formMood, setFormMood] = useState(4)

  const addEntry = useCallback(() => {
    if (!formContent.trim()) return

    const newEntry: LogbookEntry = {
      id: `entry-${Date.now()}`,
      flightId,
      category: formCategory,
      content: formContent.trim(),
      mood: formMood,
      timestamp: new Date().toISOString(),
    }

    setEntries((prev) => [newEntry, ...prev])
    setFormContent('')
    setFormMood(4)
    setShowForm(false)
  }, [flightId, formCategory, formContent, formMood])

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Logbuch</h2>
          <Badge variant="secondary" className="text-xs">{entries.length}</Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span className="sr-only">{showForm ? 'Close form' : 'Add entry'}</span>
        </Button>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <div className="shrink-0 border-b border-border bg-secondary/30 p-4">
          {/* Category Selection */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFormCategory(cat.id)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  formCategory === cat.id
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                <cat.icon className="h-3 w-3" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="What happened? Share your experience..."
            className="mb-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            rows={3}
          />

          {/* Mood */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mood:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFormMood(star)}
                  className={cn(
                    'text-lg transition-colors',
                    star <= formMood ? 'text-chart-4' : 'text-muted'
                  )}
                >
                  <Star className={cn('h-4 w-4', star <= formMood && 'fill-current')} />
                </button>
              ))}
            </div>
          </div>

          <Button onClick={addEntry} size="sm" disabled={!formContent.trim()}>
            Add Entry
          </Button>
        </div>
      )}

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Your logbook is empty</p>
            <p className="text-xs text-muted-foreground">Start documenting your flight experience!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-3">
            {entries.map((entry) => (
              <LogbookEntryCard key={entry.id} entry={entry} onDelete={deleteEntry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
