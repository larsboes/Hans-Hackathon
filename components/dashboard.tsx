'use client';

import { useState, useCallback, useRef, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { FlightData, LogbookEntry, Achievement, StorySection } from '@/lib/types';
import { saveCompletedFlight } from '@/lib/firebase-db';
import { ChatPanel } from '@/components/chat/chat-panel';
import { ChatProvider } from '@/components/chat/chat-context';
import { LogbookPanel } from '@/components/logbook/logbook-panel';
import { FlightInfo } from '@/components/flight/flight-info';
import { AchievementsStrip } from '@/components/achievements/achievements-strip';
import Image from 'next/image';
import {
  MessageSquare,
  BookOpen,
  Trophy,
  Globe,
  Loader2,
  FastForward,
  Coins,
  Plane,
} from 'lucide-react';

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
);

type MobileTab = 'flight' | 'logbook' | 'chat' | 'achievements';

const MOBILE_TABS: { id: MobileTab; label: string; icon: ReactNode }[] = [
  { id: 'flight', label: 'Flight', icon: <Globe className="h-5 w-5" /> },
  { id: 'logbook', label: 'Logbook', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'chat', label: 'Chat', icon: <MessageSquare className="h-5 w-5" /> },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: <Trophy className="h-5 w-5" />,
  },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<MobileTab>('flight');
  const [flight, setFlight] = useState<FlightData | null>(null);
  const [planeModel, setPlaneModel] = useState<'default' | 'glurak' | 'duck'>(
    'default',
  );
  const [demoLanded, setDemoLanded] = useState(false);
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const flightSavedRef = useRef(false);

  const triggerDemo = useCallback(() => {
    if (!flight) return;
    setDemoLanded(true);
    setLogbookEntries((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: 'demo-1',
          flightId: flight.id,
          category: 'experience',
          content:
            'Beautiful sunrise over the Atlantic! The sky turned pink and gold.',
          mood: 5,
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'demo-2',
          flightId: flight.id,
          category: 'crew',
          content:
            'The flight attendant was incredibly kind, brought me an extra blanket without asking.',
          mood: 5,
          timestamp: new Date(
            Date.now() - 2 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          id: 'demo-3',
          flightId: flight.id,
          category: 'seat',
          content:
            'Window seat with a great view and good legroom for economy.',
          mood: 4,
          timestamp: new Date(
            Date.now() - 3 * 60 * 60 * 1000,
          ).toISOString(),
        },
      ];
    });
  }, [flight]);


  const addLogbookEntry = useCallback((entry: LogbookEntry) => {
    setLogbookEntries((prev) => [entry, ...prev]);
  }, []);

  const deleteLogbookEntry = useCallback((id: string) => {
    setLogbookEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleFlightSelected = useCallback((selectedFlight: FlightData) => {
    setFlight(selectedFlight);
    setDemoLanded(false);
    setLogbookEntries([]);
    setActiveTab('flight');
    flightSavedRef.current = false;
  }, []);

  const handleStoryComplete = useCallback(
    (sections: StorySection[]) => {
      if (!flight || flightSavedRef.current) return;
      flightSavedRef.current = true;

      const moods = logbookEntries.map((e) => e.mood);
      const averageMood =
        moods.length > 0
          ? moods.reduce((a, b) => a + b, 0) / moods.length
          : 0;

      const unlockedIds = achievements
        .filter((a) => a.unlockedAt)
        .map((a) => a.id);

      saveCompletedFlight({
        flightNumber: flight.flightNumber,
        airline: flight.airline,
        departure: flight.departure,
        arrival: flight.arrival,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        storySections: sections.map(({ title, text, imagePrompt }) => ({
          title,
          text,
          imagePrompt,
        })),
        achievementIds: unlockedIds,
        logbookEntries,
        averageMood: Math.round(averageMood * 10) / 10,
      });
    },
    [flight, logbookEntries, achievements],
  );

  const handleAchievementsChange = useCallback((achs: Achievement[]) => {
    setAchievements(achs);
  }, []);

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
            <h1 className="text-lg font-semibold text-foreground">Hans</h1>
            {flight && (
              <span className="hidden rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary sm:inline-block">
                {flight.flightNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/flights"
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
            >
              <Plane className="h-3 w-3" />
              My Flights
            </Link>
            {earnings > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-chart-4/15 px-2.5 py-1 text-xs font-semibold text-chart-4">
                <Coins className="h-3.5 w-3.5" />
                {earnings.toFixed(2)} &euro;
              </span>
            )}
            {flight && !demoLanded && (
              <button
                onClick={triggerDemo}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
              >
                <FastForward className="h-3 w-3" />
                Demo
              </button>
            )}
            {flight ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                  demoLanded
                    ? 'bg-primary/15 text-primary'
                    : 'bg-chart-1/15 text-chart-1',
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    demoLanded ? 'bg-primary' : 'flight-pulse bg-chart-1',
                  )}
                />
                {demoLanded ? 'Landed' : 'In Flight'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Waiting for flight number
              </span>
            )}
          </div>
        </header>

        {/* Desktop Layout */}
        <div className="hidden flex-1 overflow-hidden lg:grid lg:grid-cols-[1fr_380px]">
          {/* Main Content Area */}
          <div className="flex flex-col overflow-hidden">
            {/* Flight Section Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Current Flight
              </h2>
              {flight && <FlightInfo flight={flight} />}
            </div>

            {/* Top: Logbook + 3D Globe */}
            {flight ? (
              <div className="flex flex-1 overflow-hidden">
                {/* Logbook */}
                <div className="w-[380px] shrink-0 border-r border-border">
                  <LogbookPanel
                    flightId={flight.id}
                    entries={logbookEntries}
                    onAddEntry={addLogbookEntry}
                    onDeleteEntry={deleteLogbookEntry}
                    hasLanded={demoLanded}
                    flight={flight}
                    onStoryComplete={handleStoryComplete}
                  />
                </div>

                {/* 3D Globe */}
                <div className="relative flex-1">
                  <FlightGlobe
                    flight={flight}
                    planeModel={planeModel}
                    onCyclePlaneModel={() =>
                      setPlaneModel((m) =>
                        m === 'default'
                          ? 'glurak'
                          : m === 'glurak'
                            ? 'duck'
                            : 'default',
                      )
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-center">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Enter your flight number in chat to load the map
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Examples: LH400, LH401, LH760
                  </p>
                </div>
              </div>
            )}

            {/* Bottom: Achievements */}
            <div className="shrink-0 border-t border-border">
              <AchievementsStrip
                demoLanded={demoLanded}
                logbookEntries={logbookEntries}
                onEarningsChange={setEarnings}
                onAchievementsChange={handleAchievementsChange}
              />
            </div>
          </div>

          {/* Chat Sidebar — desktop */}
          <div className="border-l border-border">
            <ChatPanel
              flight={flight}
              onFlightSelected={handleFlightSelected}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
          {/* Mobile Content — all tabs always mounted, shown/hidden via CSS */}
          <div className="relative flex-1 overflow-hidden">
            <div
              className={cn(
                'absolute inset-0',
                activeTab !== 'flight' && 'pointer-events-none invisible',
              )}
            >
              <div className="flex h-full flex-col">
                <div className="shrink-0 border-b border-border px-4 py-2">
                  {flight ? (
                    <FlightInfo flight={flight} />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Enter a flight number in chat to load the map.
                    </p>
                  )}
                </div>
                <div className="relative flex-1">
                  {flight ? (
                    <FlightGlobe
                      flight={flight}
                      planeModel={planeModel}
                      onCyclePlaneModel={() =>
                        setPlaneModel((m) =>
                          m === 'default'
                            ? 'glurak'
                            : m === 'glurak'
                              ? 'duck'
                              : 'default',
                        )
                      }
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Map waiting for flight number
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Open chat and enter e.g. LH400 or LH760
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              className={cn(
                'absolute inset-0',
                activeTab !== 'logbook' && 'pointer-events-none invisible',
              )}
            >
              {flight ? (
                <LogbookPanel
                  flightId={flight.id}
                  entries={logbookEntries}
                  onAddEntry={addLogbookEntry}
                  onDeleteEntry={deleteLogbookEntry}
                  hasLanded={demoLanded}
                  flight={flight}
                  onStoryComplete={handleStoryComplete}
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Select a flight in chat first.
                  </p>
                </div>
              )}
            </div>
            <div
              className={cn(
                'absolute inset-0',
                activeTab !== 'chat' && 'pointer-events-none invisible',
              )}
            >
              <ChatPanel
                flight={flight}
                onFlightSelected={handleFlightSelected}
              />
            </div>
            <div
              className={cn(
                'absolute inset-0 overflow-y-auto p-4',
                activeTab !== 'achievements' && 'pointer-events-none invisible',
              )}
            >
              <AchievementsStrip
                fullView
                demoLanded={demoLanded}
                logbookEntries={logbookEntries}
                onEarningsChange={setEarnings}
                onAchievementsChange={handleAchievementsChange}
              />
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
  );
}
