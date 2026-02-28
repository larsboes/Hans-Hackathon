'use client'

import { useState, useEffect } from 'react'
import type { FlightData } from '@/lib/types'
import { getFlightProgress } from '@/lib/flight-data'
import { Plane, Clock } from 'lucide-react'

interface FlightInfoProps {
  flight: FlightData
}

export function FlightInfo({ flight }: FlightInfoProps) {
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    function update() {
      setProgress(Math.round(getFlightProgress(flight) * 100))

      const arrival = new Date(flight.arrivalTime).getTime()
      const remaining = arrival - Date.now()
      if (remaining <= 0) {
        setTimeRemaining('Arrived')
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60))
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
        setTimeRemaining(`${hours}h ${minutes}m remaining`)
      }
    }

    update()
    const interval = setInterval(update, 30_000)
    return () => clearInterval(interval)
  }, [flight])

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-foreground">{flight.departure.code}</span>
        <div className="flex items-center gap-1">
          <div className="h-px w-6 bg-border" />
          <Plane className="h-3 w-3 text-primary" />
          <div className="h-px w-6 bg-border" />
        </div>
        <span className="font-semibold text-foreground">{flight.arrival.code}</span>
      </div>
      <div className="hidden items-center gap-3 sm:flex">
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{timeRemaining}</span>
        </div>
      </div>
    </div>
  )
}
