'use client'

import { cn } from '@/lib/utils'
import type { FlightData, TravelerType } from '@/lib/types'
import { Plane, User, ShieldAlert } from 'lucide-react'

interface SuggestionChipsProps {
  selectedType: TravelerType | null
  onSelectType: (type: TravelerType) => void
  onSuggestionClick: (suggestion: string) => void
  compact?: boolean
  flight?: FlightData
}

const TRAVELER_TYPES: { id: TravelerType; label: string; icon: React.ReactNode }[] = [
  { id: 'enthusiast', label: 'Aviation Enthusiast', icon: <Plane className="h-3.5 w-3.5" /> },
  { id: 'normalo', label: 'Casual Traveler', icon: <User className="h-3.5 w-3.5" /> },
  { id: 'nervous', label: 'Nervous Flyer', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
]

function getSuggestions(flight?: FlightData): Record<TravelerType, string[]> {
  const fn = flight?.flightNumber ?? 'LH 400'
  const dep = flight?.departure.city ?? 'Frankfurt'
  const arr = flight?.arrival.city ?? 'New York'
  const arrCode = flight?.arrival.code ?? 'JFK'

  return {
    enthusiast: [
      'What aircraft type are we flying on today?',
      `What is the current status of flight ${fn}?`,
      `What flights go from ${dep} to ${arr} tomorrow?`,
      'Tell me about the airports on this route!',
    ],
    normalo: [
      'Are we on time? Any delays?',
      'What gate do we depart from?',
      `What terminal do we arrive at in ${arrCode}?`,
      `What is there to do in ${arr}?`,
    ],
    nervous: [
      'Is our flight on time? Any turbulence expected?',
      'How long until we land?',
      'What is the current flight status?',
      'Can you tell me something calming about flying?',
    ],
  }
}

export function SuggestionChips({
  selectedType,
  onSelectType,
  onSuggestionClick,
  compact = false,
  flight,
}: SuggestionChipsProps) {
  const SUGGESTIONS = getSuggestions(flight)
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
      {/* Persona Selection */}
      <div>
        <p className="mb-2 text-center text-xs text-muted-foreground">What kind of flyer are you?</p>
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
