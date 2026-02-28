'use client'

import { cn } from '@/lib/utils'
import type { TravelerType } from '@/lib/types'
import { Briefcase, Palmtree, Baby, Repeat } from 'lucide-react'

interface SuggestionChipsProps {
  selectedType: TravelerType | null
  onSelectType: (type: TravelerType) => void
  onSuggestionClick: (suggestion: string) => void
  compact?: boolean
}

const TRAVELER_TYPES: { id: TravelerType; label: string; icon: React.ReactNode }[] = [
  { id: 'business', label: 'Business', icon: <Briefcase className="h-3.5 w-3.5" /> },
  { id: 'leisure', label: 'Leisure', icon: <Palmtree className="h-3.5 w-3.5" /> },
  { id: 'family', label: 'Family', icon: <Baby className="h-3.5 w-3.5" /> },
  { id: 'frequent', label: 'Frequent Flyer', icon: <Repeat className="h-3.5 w-3.5" /> },
]

const SUGGESTIONS: Record<TravelerType, string[]> = {
  business: [
    'Best restaurants near JFK for a business dinner?',
    'How to stay productive during a long flight?',
    'Tips for beating jet lag before a morning meeting',
    'Lounge recommendations at my destination',
  ],
  leisure: [
    'What are must-see attractions in New York?',
    'Best local food I should try at my destination?',
    'Hidden gems in NYC most tourists miss',
    'What is the weather like at my destination?',
  ],
  family: [
    'Fun activities for kids near JFK airport?',
    'Child-friendly restaurants in New York City',
    'How to keep kids entertained during a long flight?',
    'Best family neighborhoods to explore in NYC',
  ],
  frequent: [
    'How many miles is this FRA-JFK route?',
    'Best strategies for earning more airline miles',
    'Compare airport lounges at Frankfurt vs JFK',
    'Optimal seat selection for long-haul flights',
  ],
}

export function SuggestionChips({
  selectedType,
  onSelectType,
  onSuggestionClick,
  compact = false,
}: SuggestionChipsProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {TRAVELER_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelectType(type.id)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs transition-colors',
              selectedType === type.id
                ? 'border-primary bg-primary/15 text-primary'
                : 'text-muted-foreground hover:border-primary/50 hover:text-foreground'
            )}
          >
            {type.icon}
            {type.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Traveler Type Selection */}
      <div>
        <p className="mb-2 text-center text-xs text-muted-foreground">I am traveling as...</p>
        <div className="flex flex-wrap justify-center gap-2">
          {TRAVELER_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelectType(type.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-all',
                selectedType === type.id
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:border-primary/50 hover:text-foreground'
              )}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {selectedType && (
        <div className="flex flex-col gap-1.5">
          <p className="text-center text-xs text-muted-foreground">Try asking...</p>
          {SUGGESTIONS[selectedType].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSuggestionClick(suggestion)}
              className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
