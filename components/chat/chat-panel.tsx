'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChatMessageBubble } from '@/components/chat/chat-message'
import { SuggestionChips } from '@/components/chat/suggestion-chips'
import type { FlightData, TravelerType } from '@/lib/types'
import { Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatPanelProps {
  flight: FlightData
}

export function ChatPanel({ flight }: ChatPanelProps) {
  const [travelerType, setTravelerType] = useState<TravelerType | null>(null)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), [])

  const { messages, sendMessage, status } = useChat({
    transport,
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleSendMessage(text: string) {
    if (!text.trim() || isStreaming) return
    sendMessage({ text })
    setInput('')
  }

  function handleSuggestionClick(suggestion: string) {
    handleSendMessage(suggestion)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">AI Companion</h2>
        <span className="text-xs text-muted-foreground">Gemini</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Welcome aboard {flight.flightNumber}!</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ask me anything about your flight, destination, or travel tips.
              </p>
            </div>
            <SuggestionChips
              selectedType={travelerType}
              onSelectType={setTravelerType}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}
            {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggestion chips when conversation is active */}
      {messages.length > 0 && !travelerType && (
        <div className="shrink-0 border-t border-border px-3 py-2">
          <SuggestionChips
            selectedType={travelerType}
            onSelectType={setTravelerType}
            onSuggestionClick={handleSuggestionClick}
            compact
          />
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage(input)
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your flight..."
            className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isStreaming}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
