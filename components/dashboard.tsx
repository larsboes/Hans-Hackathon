'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { createDemoFlight } from '@/lib/flight-data'
import type { FlightData, LogbookEntry } from '@/lib/types'
import { ChatPanel } from '@/components/chat/chat-panel'
import { ChatProvider } from '@/components/chat/chat-context'
import { LogbookPanel } from '@/components/logbook/logbook-panel'
import { FlightInfo } from '@/components/flight/flight-info'
import { AchievementsStrip } from '@/components/achievements/achievements-strip'
import Image from 'next/image'
import {
  MessageSquare,
  BookOpen,
  Trophy,
  Globe,
  Loader2,
  FastForward,
} from 'lucide-react'

const FlightGlobe = dynamic(
  () =>
    import('@/components/flight/flight-globe').then((mod) => ({
      default: mod.FlightGlobe,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">
            Loading Globe...
          </span>
        </div>
      </div>
    ),
  },
)

type MobileTab = 'flight' | 'logbook' | 'chat' | 'achievements'

const MOBILE_TABS: { id: MobileTab; label: string; icon: ReactNode }[] = [
  { id: 'flight', label: 'Flight', icon: <Globe className="h-5 w-5" /> },
  { id: 'logbook', label: 'Logbook', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'chat', label: 'Chat', icon: <MessageSquare className="h-5 w-5" /> },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: <Trophy className="h-5 w-5" />,
  },
]

const INITIAL_LOGBOOK_ENTRIES: LogbookEntry[] = [
  {
    id: 'demo-1',
    flightId: 'demo-flight-1',
    category: 'experience',
    content: 'Beautiful sunrise over the Atlantic! The sky turned pink and gold.',
    mood: 5,
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    flightId: 'demo-flight-1',
    category: 'crew',
    content: 'The flight attendant was incredibly kind, brought me an extra blanket without asking.',
    mood: 5,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    flightId: 'demo-flight-1',
    category: 'seat',
    content: 'Window seat 14A - great view and good legroom for economy.',
    mood: 4,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
]

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<MobileTab>('flight')
  const [flight, setFlight] = useState<FlightData>(() => createDemoFlight())
  const [planeModel, setPlaneModel] = useState<'default' | 'glurak' | 'duck'>('default')
  const [demoLanded, setDemoLanded] = useState(false)
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>(INITIAL_LOGBOOK_ENTRIES)

  // Fetch real flight data from Lufthansa API
  useEffect(() => {
    fetch('/api/flight/status')
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`)
        return res.json()
      })
      .then((data: FlightData) => {
        setFlight(data)
      })
      .catch((err) => {
        console.warn('Could not fetch live flight data, using demo:', err.message)
      })
  }, [])

  const addLogbookEntry = useCallback((entry: LogbookEntry) => {
    setLogbookEntries((prev) => [entry, ...prev])
  }, [])

  const deleteLogbookEntry = useCallback((id: string) => {
    setLogbookEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return (
    <ChatProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background font-sans">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/Hans.png"
              alt="Hans logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover"
            />
            <h1 className="text-lg font-semibold text-foreground">Impeccable Quail</h1>
            <span className="hidden rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary sm:inline-block">
              {flight.flightNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!demoLanded && (
              <button
                onClick={() => setDemoLanded(true)}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
              >
                <FastForward className="h-3 w-3" />
                Skip to Landing
              </button>
            )}
            <span className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              demoLanded
                ? 'bg-primary/15 text-primary'
                : 'bg-chart-1/15 text-chart-1'
            )}>
              <span className={cn(
                'h-1.5 w-1.5 rounded-full',
                demoLanded ? 'bg-primary' : 'flight-pulse bg-chart-1'
              )} />
              {demoLanded ? 'Landed' : 'In Flight'}
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
                <LogbookPanel flightId={flight.id} entries={logbookEntries} onAddEntry={addLogbookEntry} onDeleteEntry={deleteLogbookEntry} hasLanded={demoLanded} flight={flight} />
              </div>

              {/* 3D Globe */}
              <div className="relative flex-1">
                <FlightGlobe
                  flight={flight}
                  planeModel={planeModel}
                  onCyclePlaneModel={() => setPlaneModel(m => m === 'default' ? 'glurak' : m === 'glurak' ? 'duck' : 'default')}
                />
              </div>
            </div>

            {/* Bottom: Achievements */}
            <div className="shrink-0 border-t border-border">
              <AchievementsStrip demoLanded={demoLanded} logbookEntries={logbookEntries} />
            </div>
          </div>

          {/* Chat Sidebar — desktop */}
          <div className="border-l border-border">
            <ChatPanel flight={flight} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
          {/* Mobile Content — all tabs always mounted, shown/hidden via CSS */}
          <div className="relative flex-1 overflow-hidden">
            <div className={cn('absolute inset-0', activeTab !== 'flight' && 'pointer-events-none invisible')}>
              <div className="flex h-full flex-col">
                <div className="shrink-0 border-b border-border px-4 py-2">
                  <FlightInfo flight={flight} />
                </div>
                <div className="relative flex-1">
                  <FlightGlobe
                    flight={flight}
                    planeModel={planeModel}
                    onCyclePlaneModel={() => setPlaneModel(m => m === 'default' ? 'glurak' : m === 'glurak' ? 'duck' : 'default')}
                  />
                </div>
              </div>
            </div>
            <div className={cn('absolute inset-0', activeTab !== 'logbook' && 'pointer-events-none invisible')}>
              <LogbookPanel flightId={flight.id} entries={logbookEntries} onAddEntry={addLogbookEntry} onDeleteEntry={deleteLogbookEntry} hasLanded={demoLanded} flight={flight} />
            </div>
            <div className={cn('absolute inset-0', activeTab !== 'chat' && 'pointer-events-none invisible')}>
              <ChatPanel flight={flight} />
            </div>
            <div className={cn('absolute inset-0 overflow-y-auto p-4', activeTab !== 'achievements' && 'pointer-events-none invisible')}>
              <AchievementsStrip fullView demoLanded={demoLanded} logbookEntries={logbookEntries} />
            </div>
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
                    : 'text-muted-foreground',
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </ChatProvider>
  )
}
