'use client'

import type { CompletedFlight } from '@/lib/types'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { Badge } from '@/components/ui/badge'
import { Plane, Star, Calendar } from 'lucide-react'

interface FlightOverviewCardProps {
  flight: CompletedFlight
}

export function FlightOverviewCard({ flight }: FlightOverviewCardProps) {
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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
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

        {/* Story preview */}
        {previewText && (
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {previewText}
          </p>
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
