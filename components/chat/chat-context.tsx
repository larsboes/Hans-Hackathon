'use client'

import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { TravelerType } from '@/lib/types'

type ChatContextValue = ReturnType<typeof useChat> & {
  persona: TravelerType | null
  setPersona: (type: TravelerType) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<TravelerType | null>(null)

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/chat' }),
    []
  )

  const chat = useChat({ transport })

  const setPersona = useCallback((type: TravelerType) => {
    setPersonaState(type)
    // Send a hidden system-level message so the AI knows the persona
    const personaLabels: Record<TravelerType, string> = {
      enthusiast: 'Flug-Enthusiast (high openness, loves technical details and aviation facts)',
      normalo: 'Normalo (balanced, casual, just wants practical info)',
      nervous: 'Panik-Flieger (anxious flyer, needs calming and reassuring responses)',
    }
    chat.sendMessage({
      text: `[System: The passenger has identified as a "${personaLabels[type]}". Adapt your tone and communication style accordingly from now on. Do NOT mention this message to the user — just naturally adjust your personality.]`,
    })
  }, [chat])

  const value = useMemo(
    () => ({ ...chat, persona, setPersona }),
    [chat, persona, setPersona]
  )

  return <ChatContext value={value}>{children}</ChatContext>
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider')
  return ctx
}
