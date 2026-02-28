'use client'

import type { UIMessage } from 'ai'
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ChatMessageBubbleProps {
  message: UIMessage
}

function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return ''
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isAssistant = message.role === 'assistant'
  const text = getMessageText(message)

  return (
    <div className={cn('flex gap-2.5', isAssistant ? 'flex-row' : 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isAssistant ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
        )}
      >
        {isAssistant ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
      </div>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isAssistant
            ? 'rounded-tl-md bg-secondary text-secondary-foreground'
            : 'rounded-tr-md bg-primary text-primary-foreground'
        )}
      >
        {isAssistant ? (
          <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        ) : (
          <p>{text}</p>
        )}
      </div>
    </div>
  )
}
