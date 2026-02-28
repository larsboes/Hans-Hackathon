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
  Zap,
  Crown,
  Cloud,
  Footprints,
  Luggage,
  HelpCircle,
  Heart,
  BookOpen,
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
  zap: Zap,
  crown: Crown,
  cloud: Cloud,
  footprints: Footprints,
  luggage: Luggage,
  heart: Heart,
  book: BookOpen,
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
  const isSecret = achievement.secret && !isCollected
  const Icon = ICON_MAP[achievement.icon] || Trophy

  async function handleCollect() {
    if (!isUnlocked || isCollected) return

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
          !isUnlocked && !isSecret && 'opacity-60'
        )}
      >
        {/* Image area */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary">
          {isSecret ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <HelpCircle className="h-8 w-8 text-primary/40" />
            </div>
          ) : achievement.imageUrl ? (
            <img
              src={achievement.imageUrl}
              alt={achievement.name}
              className={cn(
                'h-full w-full object-cover transition-all',
                !isCollected && 'blur-[6px] grayscale'
              )}
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
          {!isCollected && !isSecret && achievement.imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="h-5 w-5 text-foreground/60 drop-shadow-md" />
            </div>
          )}
        </div>

        <div>
          <p className="truncate text-xs font-semibold text-foreground">
            {isSecret ? '???' : achievement.name}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            {isSecret ? 'Secret achievement' : achievement.description}
          </p>
        </div>

        {isUnlocked && !isCollected && !isSecret && (
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
        !isUnlocked && !isSecret && 'opacity-60'
      )}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary">
        {isSecret ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5">
            <HelpCircle className="h-10 w-10 text-primary/40" />
            <span className="text-xs font-medium text-primary/50">Secret</span>
          </div>
        ) : achievement.imageUrl ? (
          <img
            src={achievement.imageUrl}
            alt={achievement.name}
            className={cn(
              'h-full w-full object-cover transition-all',
              !isCollected && 'blur-[6px] grayscale'
            )}
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
        {!isCollected && !isSecret && achievement.imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="h-6 w-6 text-foreground/60 drop-shadow-md" />
          </div>
        )}
        {isCollected && (
          <div className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Collected
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground">
          {isSecret ? '???' : achievement.name}
        </h4>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {isSecret ? 'Complete a secret challenge to unlock' : achievement.description}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
          {isSecret ? 'secret' : achievement.category}
        </span>
        {isUnlocked && !isCollected && !isSecret && (
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
