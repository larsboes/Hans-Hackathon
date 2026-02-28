'use client'

import { useState, useEffect, useRef } from 'react'
import type { FlightData, LogbookEntry, StorySection } from '@/lib/types'
import { Plane } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlightStoryProps {
  flight: FlightData
  entries: LogbookEntry[]
  onStoryComplete?: (sections: StorySection[]) => void
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-muted/60', className)} />
  )
}

export function FlightStory({ flight, entries, onStoryComplete }: FlightStoryProps) {
  const [sections, setSections] = useState<StorySection[]>([])
  const [journeyImageUrl, setJourneyImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const storyCompleteCalledRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function generateStory() {
      try {
        // Step 1: Generate story text
        const textRes = await fetch('/api/story/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flight,
            entries,
            achievements: [],
          }),
        })

        if (!textRes.ok) throw new Error('Failed to generate story')

        const { sections: storySections } = await textRes.json()
        if (cancelled) return

        setSections(storySections)
        setLoading(false)

        if (!storyCompleteCalledRef.current && onStoryComplete) {
          storyCompleteCalledRef.current = true
          onStoryComplete(storySections)
        }

        // Step 2: Generate one image for the entire journey
        try {
          const journeyPrompt = [
            `${flight.airline} ${flight.flightNumber}`,
            `${flight.departure.city} (${flight.departure.code}) to ${flight.arrival.city} (${flight.arrival.code})`,
            storySections.map((section: StorySection) => section.imagePrompt).join('. '),
          ].join('. ')

          const imgRes = await fetch('/api/story/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: journeyPrompt }),
          })

          if (!imgRes.ok || cancelled) return

          const { imageUrl } = await imgRes.json()
          if (imageUrl) {
            setJourneyImageUrl(imageUrl)
          }
        } catch {
          // Non-blocking: story text should still render without image
        }
      } catch (err) {
        if (!cancelled) {
          setError('Could not generate story.')
          setLoading(false)
        }
      }
    }

    generateStory()
    return () => { cancelled = true }
  }, [flight, entries])

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Plane className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          My Journey
        </h3>
        <span className="text-xs text-muted-foreground">
          {flight.departure.code} → {flight.arrival.code}
        </span>
      </div>

      {!loading && (
        journeyImageUrl ? (
          <img
            src={journeyImageUrl}
            alt="Journey illustration"
            className="h-44 w-full rounded-lg object-cover"
          />
        ) : (
          <SkeletonBlock className="h-44 w-full rounded-lg" />
        )
      )}

      {/* Sections */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-32 w-full rounded-lg" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {sections.map((section, i) => (
            <div key={i} className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">
                {section.title}
              </h4>

              {/* Text */}
              <p className="text-sm leading-relaxed text-muted-foreground">
                {section.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
