'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ACHIEVEMENTS, matchAchievements } from '@/lib/achievements'
import { AchievementCard } from '@/components/achievements/achievement-card'
import type { Achievement, LogbookEntry } from '@/lib/types'
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AchievementsStripProps {
  fullView?: boolean
  demoLanded?: boolean
  logbookEntries?: LogbookEntry[]
}

export function AchievementsStrip({ fullView = false, demoLanded = false, logbookEntries = [] }: AchievementsStripProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(
    ACHIEVEMENTS.map((a) => ({
      ...a,
      // Achievements unlock after flight — all locked during flight
      unlockedAt: undefined,
      collected: false,
    }))
  )
  const [showLibrary, setShowLibrary] = useState(false)
  const [demoApplied, setDemoApplied] = useState(false)

  // When demo landing triggers, analyze logbook entries to unlock matching achievements
  if (demoLanded && !demoApplied) {
    setDemoApplied(true)
    const unlockIds = matchAchievements(logbookEntries)
    setAchievements((prev) =>
      prev.map((a) =>
        unlockIds.includes(a.id)
          ? { ...a, unlockedAt: new Date().toISOString() }
          : a
      )
    )
  }

  const collected = achievements.filter((a) => a.collected).length
  const unlocked = achievements.filter((a) => a.unlockedAt).length

  function handleCollect(id: string) {
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, collected: true } : a
      )
    )
  }

  function handleImageGenerated(id: string, imageUrl: string) {
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, imageUrl } : a
      )
    )
  }

  if (fullView) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Achievement Library</h2>
          </div>
          <Badge variant="secondary">{collected}/{achievements.length} collected</Badge>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(collected / achievements.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{Math.round((collected / achievements.length) * 100)}%</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onCollect={handleCollect}
              onImageGenerated={handleImageGenerated}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
          <Badge variant="secondary" className="text-xs">{collected}/{achievements.length}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(collected / achievements.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="w-44 shrink-0">
            <AchievementCard
              achievement={achievement}
              onCollect={handleCollect}
              onImageGenerated={handleImageGenerated}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  )
}
