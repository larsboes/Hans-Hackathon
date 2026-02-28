'use client'

import { cn } from '@/lib/utils'
import type { LogbookEntry } from '@/lib/types'
import {
  Clock,
  Users,
  Armchair,
  UtensilsCrossed,
  Star,
  MessageCircle,
  Trash2,
} from 'lucide-react'

interface LogbookEntryCardProps {
  entry: LogbookEntry
  onDelete: (id: string) => void
}

const CATEGORY_CONFIG = {
  delay: { icon: Clock, label: 'Delay', color: 'text-destructive', bg: 'bg-destructive/15' },
  crew: { icon: Users, label: 'Crew', color: 'text-chart-2', bg: 'bg-chart-2/15' },
  seat: { icon: Armchair, label: 'Seat', color: 'text-chart-4', bg: 'bg-chart-4/15' },
  food: { icon: UtensilsCrossed, label: 'Food', color: 'text-chart-5', bg: 'bg-chart-5/15' },
  experience: { icon: Star, label: 'Experience', color: 'text-primary', bg: 'bg-primary/15' },
  other: { icon: MessageCircle, label: 'Other', color: 'text-muted-foreground', bg: 'bg-muted' },
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function LogbookEntryCard({ entry, onDelete }: LogbookEntryCardProps) {
  const config = CATEGORY_CONFIG[entry.category]
  const Icon = config.icon

  return (
    <div className="glass-card group relative rounded-xl p-3 transition-all">
      <div className="flex items-start gap-3">
        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', config.bg)}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
            <span className="text-xs text-muted-foreground">{formatTime(entry.timestamp)}</span>
            <div className="ml-auto flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-2.5 w-2.5',
                    i < entry.mood ? 'fill-chart-4 text-chart-4' : 'text-muted'
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{entry.content}</p>
        </div>
      </div>
      <button
        onClick={() => onDelete(entry.id)}
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
        <span className="sr-only">Delete entry</span>
      </button>
    </div>
  )
}
