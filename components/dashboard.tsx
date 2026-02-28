'use client'

import { useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { DEMO_FLIGHT } from '@/lib/flight-data'
import type { FlightData } from '@/lib/types'
import { ChatPanel } from '@/components/chat/chat-panel'
import { LogbookPanel } from '@/components/logbook/logbook-panel'
import { FlightInfo } from '@/components/flight/flight-info'
import { AchievementsStrip } from '@/components/achievements/achievements-strip'
import {
  MessageSquare,
  BookOpen,
  Trophy,
  Globe,
  Plane,
  Loader2,
} from 'lucide-react'

const FlightGlobe = dynamic(
  () => import('@/components/flight/flight-globe').then(mod => ({ default: mod.FlightGlobe })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading 3D Globe...</span>
        </div>
      </div>
    ),
  }
)

type MobileTab = 'flight' | 'logbook' | 'chat' | 'achievements'

const MOBILE_TABS: { id: MobileTab; label: string; icon: ReactNode }[] = [
  { id: 'flight', label: 'Flight', icon: <Globe className="h-5 w-5" /> },
  { id: 'logbook', label: 'Logbook', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'chat', label: 'Chat', icon: <MessageSquare className="h-5 w-5" /> },
  { id: 'achievements', label: 'Achievements', icon: <Trophy className="h-5 w-5" /> },
]

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<MobileTab>('flight')
  const [flight] = useState<FlightData>(DEMO_FLIGHT)
  const [charizardMode, setCharizardMode] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Plane className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Impeccable Quail</h1>
          <span className="hidden rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary sm:inline-block">
            {flight.flightNumber}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-chart-1/15 px-2.5 py-1 text-xs font-medium text-chart-1">
            <span className="flight-pulse h-1.5 w-1.5 rounded-full bg-chart-1" />
            In Flight
          </span>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="hidden flex-1 overflow-hidden lg:grid lg:grid-cols-[1fr_380px]">
        {/* Main Content Area */}
        <div className="flex flex-col overflow-hidden">
          {/* Flight Section Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
            <h2 className="text-sm font-medium text-muted-foreground">Current Flight</h2>
            <FlightInfo flight={flight} />
          </div>
          
          {/* Top: Logbook + 3D Globe */}
          <div className="flex flex-1 overflow-hidden">
            {/* Logbook */}
            <div className="w-[380px] shrink-0 border-r border-border">
              <LogbookPanel flightId={flight.id} />
            </div>
            
            {/* 3D Globe */}
            <div className="relative flex-1">
              <FlightGlobe
                flight={flight}
                charizardMode={charizardMode}
                onToggleCharizard={() => setCharizardMode(!charizardMode)}
              />
            </div>
          </div>
          
          {/* Bottom: Achievements */}
          <div className="shrink-0 border-t border-border">
            <AchievementsStrip />
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="border-l border-border">
          <ChatPanel flight={flight} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'flight' && (
            <div className="flex h-full flex-col">
              <div className="shrink-0 border-b border-border px-4 py-2">
                <FlightInfo flight={flight} />
              </div>
              <div className="relative flex-1">
                <FlightGlobe
                  flight={flight}
                  charizardMode={charizardMode}
                  onToggleCharizard={() => setCharizardMode(!charizardMode)}
                />
              </div>
            </div>
          )}
          {activeTab === 'logbook' && (
            <LogbookPanel flightId={flight.id} />
          )}
          {activeTab === 'chat' && (
            <ChatPanel flight={flight} />
          )}
          {activeTab === 'achievements' && (
            <div className="h-full overflow-y-auto p-4">
              <AchievementsStrip fullView />
            </div>
          )}
        </div>

        {/* Mobile Tab Bar */}
        <nav className="flex shrink-0 items-center border-t border-border bg-card">
          {MOBILE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors',
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
