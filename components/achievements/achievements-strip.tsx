'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ACHIEVEMENTS, matchAchievements } from '@/lib/achievements'
import { AchievementCard } from '@/components/achievements/achievement-card'
import { AchievementPopup } from '@/components/achievements/achievement-popup'
import type { Achievement, LogbookEntry } from '@/lib/types'
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AchievementsStripProps {
  fullView?: boolean
  demoLanded?: boolean
  logbookEntries?: LogbookEntry[]
  initialAchievements?: Achievement[]
  onEarningsChange?: (euros: number) => void
  onAchievementsChange?: (achievements: Achievement[]) => void
}

function calcEarnings(list: Achievement[]): number {
  return list
    .filter((a) => a.collected)
    .reduce((sum, a) => sum + (a.secret ? 2 : 0.5), 0)
}

export function AchievementsStrip({ fullView = false, demoLanded = false, logbookEntries = [], initialAchievements, onEarningsChange, onAchievementsChange }: AchievementsStripProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(
    initialAchievements && initialAchievements.length > 0
      ? initialAchievements
      : ACHIEVEMENTS.map((a) => ({
          ...a,
          unlockedAt: undefined,
          collected: false,
        }))
  )
  const [showLibrary, setShowLibrary] = useState(false)
  const [demoApplied, setDemoApplied] = useState(
    // If restoring with already-unlocked achievements, skip re-matching
    initialAchievements?.some((a) => a.unlockedAt) ?? false
  )
  const [popupQueue, setPopupQueue] = useState<Achievement[]>([])

  // When demo landing triggers, analyze logbook entries to unlock matching achievements
  useEffect(() => {
    if (!demoLanded || demoApplied) return
    setDemoApplied(true)
    const unlockIds = matchAchievements(logbookEntries)
    setAchievements((prev) => {
      const next = prev.map((a) =>
        unlockIds.includes(a.id)
          ? {
              ...a,
              unlockedAt: new Date().toISOString(),
              // Secret achievements auto-collect (gifted by crew)
              collected: a.secret ? true : a.collected,
            }
          : a
      )
      setPopupQueue(next.filter((a) => unlockIds.includes(a.id)))
      return next
    })
  }, [demoLanded, demoApplied, logbookEntries])

  const collected = achievements.filter((a) => a.collected).length
  const unlocked = achievements.filter((a) => a.unlockedAt).length
  const currentEarnings = calcEarnings(achievements)

  useEffect(() => {
    onEarningsChange?.(currentEarnings)
  }, [currentEarnings, onEarningsChange])

  useEffect(() => {
    onAchievementsChange?.(achievements)
  }, [achievements, onAchievementsChange])

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

  const popup = popupQueue.length > 0 ? (
    <AchievementPopup
      achievements={popupQueue}
      onDone={() => setPopupQueue([])}
    />
  ) : null

  if (fullView) {
    return (
      <>
        {popup}
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
      </>
    )
  }

  return (
    <>
    {popup}
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
    </>
  )
}
