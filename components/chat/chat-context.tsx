'use client'

import { createContext, useContext, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

type ChatContextValue = ReturnType<typeof useChat>

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), [])
  const chat = useChat({ transport })

  return <ChatContext value={chat}>{children}</ChatContext>
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider')
  return ctx
}
