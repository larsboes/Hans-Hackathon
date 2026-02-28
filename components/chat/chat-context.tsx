'use client'

import { createContext, useContext, useMemo, useState, useCallback, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { FlightData, TravelerType } from '@/lib/types'

type ChatContextValue = ReturnType<typeof useChat> & {
  persona: TravelerType | null
  setPersona: (type: TravelerType) => void
  setFlight: (flight: FlightData) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<TravelerType | null>(null)
  const flightRef = useRef<FlightData | null>(null)

  const transport = useMemo(
    () => new DefaultChatTransport({
      api: '/api/chat',
      body: () => (flightRef.current ? { flight: flightRef.current } : {}),
    }),
    []
  )

  const chat = useChat({ transport })

  const setFlight = useCallback((f: FlightData) => {
    flightRef.current = f
  }, [])

  const setPersona = useCallback((type: TravelerType) => {
    setPersonaState(type)
    // Send a hidden system-level message so the AI knows the persona
    const personaLabels: Record<TravelerType, string> = {
      enthusiast: 'Aviation Enthusiast (high openness, loves technical details and aviation facts)',
      normalo: 'Casual Traveler (balanced, casual, just wants practical info)',
      nervous: 'Nervous Flyer (anxious flyer, needs calming and reassuring responses)',
    }
    chat.sendMessage({
      text: `[System: The passenger has identified as a "${personaLabels[type]}". Adapt your tone and communication style accordingly from now on. Do NOT mention this message to the user — just naturally adjust your personality.]`,
    })
  }, [chat])

  const value = useMemo(
    () => ({ ...chat, persona, setPersona, setFlight }),
    [chat, persona, setPersona, setFlight]
  )

  return <ChatContext value={value}>{children}</ChatContext>
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider')
  return ctx
}
