'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCompletedFlights } from '@/lib/firebase-db'
import type { CompletedFlight } from '@/lib/types'
import { FlightOverviewCard } from '@/components/flights/flight-overview-card'
import { ArrowLeft, Plane } from 'lucide-react'

export default function FlightsPage() {
  const [flights, setFlights] = useState<CompletedFlight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCompletedFlights().then((data) => {
      setFlights(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 lg:px-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <Image
          src="/assets/Hans.png"
          alt="Hans logo"
          width={32}
          height={32}
          className="h-8 w-8 rounded-lg object-cover"
        />
        <h1 className="text-lg font-semibold text-foreground">My Flights</h1>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl p-4 lg:p-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-xl border border-border bg-muted/40"
              />
            ))}
          </div>
        ) : flights.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Plane className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">
              No flights yet
            </p>
            <p className="text-xs text-muted-foreground">
              Complete a flight and generate a story to see it here.
            </p>
            <Link
              href="/"
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start a flight
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flights.map((flight) => (
              <FlightOverviewCard key={flight.id} flight={flight} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
