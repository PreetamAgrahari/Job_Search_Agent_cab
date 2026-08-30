'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowUp,
  Loader2,
  AlertTriangle,
  Sparkles,
  FileText,
  Globe,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { askAgent, ApiError, type AiMode } from '@/lib/api'
import { useApp } from '@/components/app-provider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AnswerText } from '@/components/answer-text'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  mode?: AiMode
  status?: 'error'
}

function uid() {
  return Math.random().toString(36).slice(2)
}

export function ChatPanel({
  defaultMode,
  allowModeSwitch = false,
  suggestions = [],
  placeholder = 'Ask the agent anything…',
}: {
  defaultMode: AiMode
  allowModeSwitch?: boolean
  suggestions?: string[]
  placeholder?: string
}) {
  const { resume } = useApp()
  const [mode, setMode] = useState<AiMode>(defaultMode)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }, [])

  useEffect(scrollToBottom, [messages, loading, scrollToBottom])

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim()
      if (!question || loading) return

      const activeMode = mode
      setMessages((m) => [
        ...m,
        { id: uid(), role: 'user', content: question, mode: activeMode },
      ])
      setInput('')
      setLoading(true)

      try {
        const res = await askAgent(question, activeMode, 3)
        setMessages((m) => [
          ...m,
          {
            id: uid(),
            role: 'assistant',
            content: res.answer,
            mode: activeMode,
          },
        ])
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Something went wrong while contacting the agent.'
        setMessages((m) => [
          ...m,
          { id: uid(), role: 'assistant', content: message, status: 'error' },
        ])
      } finally {
        setLoading(false)
        inputRef.current?.focus()
      }
    },
    [loading, mode],
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      e.keyCode !== 229
    ) {
      e.preventDefault()
      send(input)
    }
  }

  const showResumeWarning = mode === 'resume' && !resume

  return (
    <div className="bg-card flex h-full flex-col overflow-hidden rounded-xl border">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary size-4" />
          <span className="text-sm font-medium">Conversation</span>
        </div>
        <div className="flex items-center gap-2">
          {allowModeSwitch ? (
            <div className="bg-muted flex items-center gap-0.5 rounded-lg p-0.5">
              <ModeTab
                active={mode === 'resume'}
                onClick={() => setMode('resume')}
                icon={FileText}
                label="Resume AI"
              />
              <ModeTab
                active={mode === 'generic'}
                onClick={() => setMode('generic')}
                icon={Globe}
                label="Generic AI"
              />
            </div>
          ) : (
            <Badge variant={mode === 'resume' ? 'default' : 'secondary'}>
              {mode === 'resume' ? (
                <FileText className="size-3" />
              ) : (
                <Globe className="size-3" />
              )}
              {mode === 'resume' ? 'Resume AI' : 'Generic AI'}
            </Badge>
          )}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMessages([])}
              aria-label="Clear conversation"
            >
              <RotateCcw />
            </Button>
          )}
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5">
        {messages.length === 0 ? (
          <EmptyState
            suggestions={suggestions}
            onPick={send}
            resumeMode={mode === 'resume'}
          />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {loading && <ThinkingBubble />}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="border-t px-4 py-3">
        {showResumeWarning && (
          <div className="text-muted-foreground mb-2 flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs">
            <AlertTriangle className="size-3.5 shrink-0" />
            No resume uploaded yet — answers may be limited. Upload one in the
            Resume tab for grounded responses.
          </div>
        )}
        <div className="bg-background focus-within:border-ring focus-within:ring-ring/30 flex items-end gap-2 rounded-xl border p-2 transition-colors focus-within:ring-3">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={1}
            className="min-h-9 resize-none border-0 bg-transparent px-2 py-1.5 shadow-none focus-visible:ring-0"
          />
          <Button
            size="icon"
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowUp />}
          </Button>
        </div>
        <p className="text-muted-foreground/70 mt-1.5 px-1 text-[11px]">
          Press Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  )
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-card text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm">
          {message.content}
        </div>
      </div>
    )
  }
  if (message.status === 'error') {
    return (
      <div className="flex justify-start">
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex max-w-[85%] items-start gap-2 rounded-2xl rounded-bl-md border px-4 py-2.5 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{message.content}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start">
      <div className="bg-muted text-foreground max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm">
        <AnswerText text={message.content} />
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted text-muted-foreground flex items-center gap-2 rounded-2xl rounded-bl-md px-4 py-3 text-sm">
        <span className="flex gap-1">
          <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
          <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
          <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full" />
        </span>
        Thinking…
      </div>
    </div>
  )
}

function EmptyState({
  suggestions,
  onPick,
  resumeMode,
}: {
  suggestions: string[]
  onPick: (s: string) => void
  resumeMode: boolean
}) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center py-8 text-center">
      <div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-xl">
        <Sparkles className="size-6" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">
        {resumeMode ? 'Ask about your resume' : 'Ask the career agent'}
      </h3>
      <p className="text-muted-foreground mt-1 max-w-md text-sm text-pretty">
        {resumeMode
          ? 'Get grounded answers based on the content of your uploaded resume.'
          : 'General career, job market, and interview guidance powered by AI.'}
      </p>
      {suggestions.length > 0 && (
        <div className="mt-6 flex w-full flex-col gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className="hover:border-primary/40 hover:bg-accent group flex items-center justify-between rounded-lg border bg-card px-4 py-2.5 text-left text-sm transition-colors"
            >
              <span>{s}</span>
              <ArrowUp className="text-muted-foreground group-hover:text-primary size-4 rotate-45" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
