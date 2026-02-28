'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { CompletedFlight } from '@/lib/types'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { Badge } from '@/components/ui/badge'
import { Plane, Star, Calendar, ChevronDown, BookOpen } from 'lucide-react'

interface FlightOverviewCardProps {
  flight: CompletedFlight
}

const CATEGORY_LABELS: Record<string, string> = {
  delay: 'Delay',
  crew: 'Crew',
  seat: 'Seat',
  food: 'Food',
  experience: 'Experience',
  other: 'Other',
}

export function FlightOverviewCard({ flight }: FlightOverviewCardProps) {
  const [expanded, setExpanded] = useState(false)

  const date = new Date(flight.savedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const previewText =
    flight.storySections?.[0]?.text?.slice(0, 150) +
    (flight.storySections?.[0]?.text?.length > 150 ? '...' : '')

  const unlockedAchievements = flight.achievementIds
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
    .filter(Boolean)

  const fullStars = Math.round(flight.averageMood)

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer',
        expanded && 'col-span-full'
      )}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Gradient hero */}
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-chart-1/20">
        <div className="flex items-center gap-3 text-foreground">
          <span className="text-2xl font-bold tracking-tight">
            {flight.departure.code}
          </span>
          <Plane className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold tracking-tight">
            {flight.arrival.code}
          </span>
        </div>
        <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <Calendar className="h-3 w-3" />
          {date}
        </div>
        <ChevronDown
          className={cn(
            'absolute bottom-2 right-2 h-4 w-4 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4">
        {/* Airline + flight number */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {flight.airline} {flight.flightNumber}
          </span>
          {/* Mood stars */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3.5 w-3.5 ${
                  s <= fullStars
                    ? 'fill-chart-4 text-chart-4'
                    : 'text-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Collapsed: story preview */}
        {!expanded && previewText && (
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {previewText}
          </p>
        )}

        {/* Expanded: full story + logbook */}
        {expanded && (
          <div className="flex flex-col gap-6" onClick={(e) => e.stopPropagation()}>
            {/* Full story sections */}
            {flight.storySections?.length > 0 && (
              <div className="flex flex-col gap-4">
                {flight.storySections.map((section, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {section.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {section.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Logbook entries */}
            {flight.logbookEntries?.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  Logbook ({flight.logbookEntries.length})
                </div>
                <div className="flex flex-col gap-2">
                  {flight.logbookEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-border bg-secondary/30 px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {CATEGORY_LABELS[entry.category] ?? entry.category}
                        </Badge>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                'h-2.5 w-2.5',
                                s <= entry.mood
                                  ? 'fill-chart-4 text-chart-4'
                                  : 'text-muted'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {entry.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Achievement badges */}
        {unlockedAchievements.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {unlockedAchievements.map((a) => (
              <Badge
                key={a!.id}
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
              >
                {a!.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
