'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  ScrollText,
  Trophy,
  Wrench,
  Target,
  Sparkles,
} from 'lucide-react'
import { askAgent, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { AnswerText } from '@/components/answer-text'

type CardSpec = {
  id: string
  title: string
  prompt: string
  icon: React.ComponentType<{ className?: string }>
}

const CARDS: CardSpec[] = [
  {
    id: 'summary',
    title: 'Professional Summary',
    icon: ScrollText,
    prompt:
      'In 3-4 sentences, write a concise professional summary of this candidate based on their resume.',
  },
  {
    id: 'strengths',
    title: 'Key Strengths',
    icon: Trophy,
    prompt:
      'List the top 4 strengths and standout achievements from this resume as concise bullet points.',
  },
  {
    id: 'skills',
    title: 'Core Skills',
    icon: Sparkles,
    prompt:
      'Extract the most important technical and professional skills from this resume as a short bullet list.',
  },
  {
    id: 'roles',
    title: 'Best-Fit Roles',
    icon: Target,
    prompt:
      'Based on this resume, suggest 4 job titles this candidate is well-suited for as bullet points.',
  },
  {
    id: 'improve',
    title: 'Improvement Suggestions',
    icon: Wrench,
    prompt:
      'Give 3-4 specific, actionable suggestions to improve this resume as bullet points.',
  },
]

export function ResumeAnalysis() {
  const [runKey, setRunKey] = useState(0)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Resume Analysis
          </h2>
          <p className="text-muted-foreground text-sm">
            Live insights generated from your uploaded resume.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRunKey((k) => k + 1)}
        >
          <RefreshCw /> Re-run
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {CARDS.map((card, i) => (
          <AnalysisCard
            key={`${card.id}-${runKey}`}
            spec={card}
            delayMs={i * 250}
            className={card.id === 'summary' ? 'md:col-span-2' : ''}
          />
        ))}
      </div>
    </div>
  )
}

function AnalysisCard({
  spec,
  delayMs,
  className,
}: {
  spec: CardSpec
  delayMs: number
  className?: string
}) {
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const Icon = spec.icon

  const run = useCallback(async () => {
    setState('loading')
    setError('')
    try {
      const res = await askAgent(spec.prompt, 'resume', 3)
      setAnswer(res.answer)
      setState('done')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to load this insight.',
      )
      setState('error')
    }
  }, [spec.prompt])

  useEffect(() => {
    // Stagger requests so we don't fire everything at once.
    const t = setTimeout(run, delayMs)
    return () => clearTimeout(t)
  }, [run, delayMs])

  return (
    <div
      className={`bg-card flex flex-col rounded-xl border p-5 ${className ?? ''}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <Icon className="size-4" />
          </div>
          <h3 className="text-sm font-semibold">{spec.title}</h3>
        </div>
        {state === 'error' && (
          <Button variant="ghost" size="icon-sm" onClick={run} aria-label="Retry">
            <RefreshCw />
          </Button>
        )}
      </div>

      {state === 'loading' && (
        <div className="flex flex-col gap-2 py-1">
          <div className="bg-muted h-3 w-full animate-pulse rounded" />
          <div className="bg-muted h-3 w-[92%] animate-pulse rounded" />
          <div className="bg-muted h-3 w-[70%] animate-pulse rounded" />
          <span className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
            <Loader2 className="size-3 animate-spin" /> Analyzing…
          </span>
        </div>
      )}

      {state === 'error' && (
        <p className="text-destructive flex items-start gap-1.5 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}

      {state === 'done' && (
        <div className="text-sm">
          <AnswerText text={answer} />
        </div>
      )}
    </div>
  )
}
