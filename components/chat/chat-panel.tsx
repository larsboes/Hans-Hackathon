'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessageBubble } from '@/components/chat/chat-message';
import { SuggestionChips } from '@/components/chat/suggestion-chips';
import { useChatContext } from '@/components/chat/chat-context';
import type { FlightData } from '@/lib/types';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatPanelProps {
  flight: FlightData | null;
  onFlightSelected: (flight: FlightData) => void;
}

const EXAMPLE_FLIGHT_NUMBERS = ['LH400', 'LH401', 'LH760', 'LH2037'] as const;

function getMessageText(message: {
  parts?: Array<{ type: string; text?: string }>;
}) {
  if (!message.parts || !Array.isArray(message.parts)) return '';
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text ?? '')
    .join('');
}

export function ChatPanel({ flight, onFlightSelected }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [flightLookupError, setFlightLookupError] = useState<string | null>(
    null,
  );
  const [isResolvingFlight, setIsResolvingFlight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sendMessage,
    status,
    persona: travelerType,
    setPersona: setTravelerType,
  } = useChatContext();

  const hasSelectedFlight = Boolean(flight);
  const visibleMessages = messages.filter((message) => {
    if (message.role !== 'user') return true;
    const text = getMessageText(message);
    return !text.startsWith('[System:');
  });
  const isStreaming =
    status === 'streaming' || status === 'submitted' || isResolvingFlight;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  async function resolveFlightFromInput(text: string) {
    const value = text.trim();
    if (!value) return;

    setFlightLookupError(null);
    setIsResolvingFlight(true);

    try {
      const response = await fetch(
        `/api/flight?flightNumber=${encodeURIComponent(value)}`,
      );
      const data = (await response.json()) as {
        flight?: FlightData;
        error?: string;
      };

      if (!response.ok || !data.flight) {
        setFlightLookupError(
          data.error ?? 'Could not find this flight number. Try again.',
        );
        return;
      }

      onFlightSelected(data.flight);
      setInput('');
      setFlightLookupError(null);
    } catch {
      setFlightLookupError('Flight lookup failed. Please try again.');
    } finally {
      setIsResolvingFlight(false);
    }
  }

  function handleSendMessage(text: string) {
    if (!text.trim() || isStreaming) return;
    if (!hasSelectedFlight) {
      void resolveFlightFromInput(text);
      return;
    }
    sendMessage({ text });
    setInput('');
  }

  function handleSuggestionClick(suggestion: string) {
    handleSendMessage(suggestion);
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
        {visibleMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              {hasSelectedFlight ? (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Welcome aboard {flight?.flightNumber}!
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ask me anything about your flight, destination, or travel
                    tips.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">
                    What is your flight number?
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter your flight number or tap one below.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    {EXAMPLE_FLIGHT_NUMBERS.map((flightNumber) => (
                      <Button
                        key={flightNumber}
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-7 rounded-full px-3 text-xs"
                        onClick={() =>
                          void resolveFlightFromInput(flightNumber)
                        }
                        disabled={isStreaming}
                      >
                        {flightNumber}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {hasSelectedFlight && (
              <SuggestionChips
                selectedType={travelerType}
                onSelectType={setTravelerType}
                onSuggestionClick={handleSuggestionClick}
                flight={flight ?? undefined}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {visibleMessages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}
            {isStreaming &&
              visibleMessages[visibleMessages.length - 1]?.role !==
                'assistant' && (
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
      {hasSelectedFlight && visibleMessages.length > 0 && !travelerType && (
        <div className="shrink-0 border-t border-border px-3 py-2">
          <SuggestionChips
            selectedType={travelerType}
            onSelectType={setTravelerType}
            onSuggestionClick={handleSuggestionClick}
            compact
            flight={flight ?? undefined}
          />
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              hasSelectedFlight
                ? 'Ask about your flight...'
                : 'Enter flight number (e.g. LH400, LH760)'
            }
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
        {flightLookupError && (
          <p className="mt-2 text-xs text-destructive">{flightLookupError}</p>
        )}
      </div>
    </div>
  );
}
