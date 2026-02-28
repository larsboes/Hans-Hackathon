'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Achievement } from '@/lib/types'
import { Sparkles, X, Trophy } from 'lucide-react'

interface AchievementPopupProps {
  achievements: Achievement[]
  onDone: () => void
}

export function AchievementPopup({ achievements, onDone }: AchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  const current = achievements[currentIndex]

  useEffect(() => {
    if (!current) {
      onDone()
      return
    }
    // Slight delay before showing for enter animation
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [currentIndex, current, onDone])

  function dismiss() {
    setExiting(true)
    setTimeout(() => {
      setExiting(false)
      setVisible(false)
      if (currentIndex + 1 < achievements.length) {
        setCurrentIndex((i) => i + 1)
      } else {
        onDone()
      }
    }, 200)
  }

  if (!current) return null

  const isSecret = current.secret

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300',
          visible && !exiting ? 'opacity-100' : 'opacity-0'
        )}
        onClick={dismiss}
      />

      {/* Card */}
      <div
        className={cn(
          'relative flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border bg-card p-6 shadow-2xl transition-all duration-300',
          isSecret ? 'border-chart-4/50' : 'border-primary/50',
          visible && !exiting
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-8 scale-95 opacity-0'
        )}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Badge */}
        <div className={cn(
          'flex h-16 w-16 items-center justify-center rounded-full',
          isSecret ? 'bg-chart-4/15' : 'bg-primary/15'
        )}>
          {isSecret ? (
            <Trophy className={cn('h-8 w-8 text-chart-4')} />
          ) : (
            <Sparkles className="h-8 w-8 text-primary" />
          )}
        </div>

        {/* Label */}
        <span className={cn(
          'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest',
          isSecret
            ? 'bg-chart-4/15 text-chart-4'
            : 'bg-primary/15 text-primary'
        )}>
          {isSecret ? 'Secret Achievement' : 'Achievement Unlocked'}
        </span>

        {/* Image */}
        {current.imageUrl && (
          <div className="h-28 w-28 overflow-hidden rounded-xl border border-border">
            <img
              src={current.imageUrl}
              alt={current.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Name & Description */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">{current.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
        </div>

        {/* Counter */}
        {achievements.length > 1 && (
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} / {achievements.length}
          </span>
        )}

        {/* Tap to continue */}
        <button
          onClick={dismiss}
          className={cn(
            'w-full rounded-lg py-2 text-sm font-medium transition-colors',
            isSecret
              ? 'bg-chart-4/15 text-chart-4 hover:bg-chart-4/25'
              : 'bg-primary/15 text-primary hover:bg-primary/25'
          )}
        >
          {currentIndex + 1 < achievements.length ? 'Next' : 'Awesome!'}
        </button>
      </div>
    </div>
  )
}
