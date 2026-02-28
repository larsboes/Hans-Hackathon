'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Achievement } from '@/lib/types'
import {
  Lock,
  Sparkles,
  Trophy,
  Plane,
  Gauge,
  Users,
  Star,
  Clock,
  Moon,
  Eye,
  UtensilsCrossed,
  Shield,
  Globe,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AchievementCardProps {
  achievement: Achievement
  onCollect: (id: string) => void
  onImageGenerated: (id: string, imageUrl: string) => void
  compact?: boolean
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'plane-takeoff': Plane,
  gauge: Gauge,
  users: Users,
  star: Star,
  clock: Clock,
  moon: Moon,
  eye: Eye,
  utensils: UtensilsCrossed,
  shield: Shield,
  globe: Globe,
}

export function AchievementCard({
  achievement,
  onCollect,
  onImageGenerated,
  compact = false,
}: AchievementCardProps) {
  const [generating, setGenerating] = useState(false)
  const isUnlocked = !!achievement.unlockedAt
  const isCollected = achievement.collected
  const Icon = ICON_MAP[achievement.icon] || Trophy

  async function handleCollect() {
    if (!isUnlocked || isCollected) return
    
    // Generate image
    setGenerating(true)
    try {
      const response = await fetch('/api/achievements/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: achievement.imagePrompt,
          achievementName: achievement.name,
        }),
      })
      const data = await response.json()
      if (data.imageUrl) {
        onImageGenerated(achievement.id, data.imageUrl)
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
    }
    setGenerating(false)
    onCollect(achievement.id)
  }

  if (compact) {
    return (
      <div
        className={cn(
          'glass-card relative flex flex-col gap-2 rounded-xl p-3 transition-all',
          isCollected && 'achievement-glow border-primary/30',
          !isUnlocked && 'opacity-50'
        )}
      >
        {/* Image area */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary">
          {achievement.imageUrl ? (
            <img
              src={achievement.imageUrl}
              alt={achievement.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {!isUnlocked ? (
                <Lock className="h-6 w-6 text-muted-foreground/50" />
              ) : (
                <Icon className="h-6 w-6 text-primary/50" />
              )}
            </div>
          )}
          {isCollected && (
            <div className="absolute right-1 top-1 rounded-full bg-primary p-0.5">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
        </div>

        <div>
          <p className="truncate text-xs font-semibold text-foreground">{achievement.name}</p>
          <p className="truncate text-[10px] text-muted-foreground">{achievement.description}</p>
        </div>

        {isUnlocked && !isCollected && (
          <Button
            size="sm"
            className="h-6 w-full text-[10px]"
            onClick={handleCollect}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              'Collect'
            )}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'glass-card relative flex flex-col gap-3 rounded-xl p-4 transition-all',
        isCollected && 'achievement-glow border-primary/30',
        !isUnlocked && 'opacity-50'
      )}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary">
        {achievement.imageUrl ? (
          <img
            src={achievement.imageUrl}
            alt={achievement.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            {!isUnlocked ? (
              <>
                <Lock className="h-8 w-8 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">Locked</span>
              </>
            ) : (
              <>
                <Icon className="h-8 w-8 text-primary/50" />
                <span className="text-xs text-muted-foreground">Ready to collect</span>
              </>
            )}
          </div>
        )}
        {isCollected && (
          <div className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Collected
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground">{achievement.name}</h4>
        <p className="mt-0.5 text-xs text-muted-foreground">{achievement.description}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
          {achievement.category}
        </span>
        {isUnlocked && !isCollected && (
          <Button
            size="sm"
            className="ml-auto h-7 gap-1 text-xs"
            onClick={handleCollect}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                Collect
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
