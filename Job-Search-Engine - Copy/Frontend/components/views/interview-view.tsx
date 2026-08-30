'use client'

import { useState } from 'react'
import { Loader2, AlertTriangle, Wand2, Mic } from 'lucide-react'
import { askAgent, ApiError } from '@/lib/api'
import { useApp } from '@/components/app-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AnswerText } from '@/components/answer-text'
import { ChatPanel } from '@/components/chat-panel'

export function InterviewView() {
  const { resume } = useApp()
  const [role, setRole] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle',
  )
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')

  const useResume = !!resume

  async function generate() {
    if (state === 'loading') return
    setState('loading')
    setError('')
    const target = role.trim()
    const question = useResume
      ? `Generate 6 likely interview questions for ${
          target ? `a "${target}" role` : 'roles matching my background'
        }, based on my resume. Mix behavioral and technical questions relevant to my experience. Present them as a numbered list.`
      : `Generate 6 common interview questions for ${
          target ? `a "${target}" role` : 'a professional role'
        }. Mix behavioral and technical questions. Present them as a numbered list.`
    try {
      const res = await askAgent(question, useResume ? 'resume' : 'generic', 4)
      setAnswer(res.answer)
      setState('done')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Generation failed.')
      setState('error')
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Interview Prep
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Generate likely questions from your background, then practice your
          answers with the agent for instant feedback.
        </p>
      </div>

      {/* generator */}
      <div className="bg-card rounded-xl border p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-muted-foreground font-mono text-[11px] tracking-wide uppercase">
              Target role (optional)
            </span>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Product Manager"
              onKeyDown={(e) => e.key === 'Enter' && generate()}
            />
          </label>
          <Button onClick={generate} disabled={state === 'loading'}>
            {state === 'loading' ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Wand2 />
            )}
            Generate questions
          </Button>
        </div>

        {useResume ? (
          <Badge variant="default" className="mt-3">
            <Mic className="size-3" /> Personalized from your resume
          </Badge>
        ) : (
          <Badge variant="muted" className="mt-3">
            Upload a resume for personalized questions
          </Badge>
        )}

        {state === 'loading' && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="bg-muted h-3 w-full animate-pulse rounded" />
            <div className="bg-muted h-3 w-[80%] animate-pulse rounded" />
            <div className="bg-muted h-3 w-[65%] animate-pulse rounded" />
          </div>
        )}
        {state === 'error' && (
          <p className="text-destructive mt-4 flex items-start gap-1.5 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}
        {state === 'done' && (
          <div className="mt-4 border-t pt-4 text-sm">
            <AnswerText text={answer} />
          </div>
        )}
      </div>

      {/* practice chat */}
      <div>
        <h2 className="text-muted-foreground mb-3 font-mono text-xs tracking-widest uppercase">
          Practice with the agent
        </h2>
        <div className="h-[32rem]">
          <ChatPanel
            defaultMode={useResume ? 'resume' : 'generic'}
            placeholder="Answer a question, or ask for feedback on your response…"
            suggestions={[
              'Ask me a behavioral interview question.',
              'Give me feedback on how to answer “Tell me about yourself”.',
              'What questions should I ask the interviewer?',
              'How do I explain a gap in my resume?',
            ]}
          />
        </div>
      </div>
    </div>
  )
}
