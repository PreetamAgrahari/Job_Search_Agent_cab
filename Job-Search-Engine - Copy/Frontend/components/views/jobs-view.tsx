'use client'

import { useState } from 'react'
import {
  Search,
  Loader2,
  AlertTriangle,
  Briefcase,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { askAgent, ApiError } from '@/lib/api'
import { useApp } from '@/components/app-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AnswerText } from '@/components/answer-text'

export function JobsView() {
  const { resume } = useApp()
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [tailor, setTailor] = useState(true)
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle',
  )
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')

  const useResume = tailor && !!resume

  async function run(query?: string) {
    const desired = (query ?? role).trim()
    if (state === 'loading') return
    setState('loading')
    setError('')

    const loc = location.trim()
    const question = useResume
      ? `Based on my resume, recommend job opportunities${
          desired ? ` for the role "${desired}"` : ' that fit my background'
        }${
          loc ? ` in ${loc}` : ''
        }. For each, give the job title, the kind of company, why it fits my experience, and what to emphasize when applying. Use bullet points.`
      : `Recommend job opportunities${
          desired ? ` for the role "${desired}"` : ''
        }${
          loc ? ` in ${loc}` : ''
        }. For each, give the job title, typical company, key requirements, and how to stand out. Use bullet points.`

    try {
      const res = await askAgent(question, useResume ? 'resume' : 'generic', 4)
      setAnswer(res.answer)
      setState('done')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Search failed.')
      setState('error')
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Job Search</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Describe what you&apos;re looking for and the agent will surface
          matching roles and how to land them.
        </p>
      </div>

      {/* search form */}
      <div className="bg-card rounded-xl border p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase">
              <Briefcase className="size-3.5" /> Target role
            </span>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              onKeyDown={(e) => e.key === 'Enter' && run()}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase">
              <MapPin className="size-3.5" /> Location
            </span>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote, Berlin"
              onKeyDown={(e) => e.key === 'Enter' && run()}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => resume && setTailor((t) => !t)}
            disabled={!resume}
            className="flex items-center gap-2 text-sm disabled:opacity-60"
          >
            <span
              className={`relative h-5 w-9 rounded-full transition-colors ${
                useResume ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${
                  useResume ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="text-primary size-3.5" />
              Tailor to my resume
              {!resume && (
                <Badge variant="muted" className="ml-1">
                  upload required
                </Badge>
              )}
            </span>
          </button>

          <Button onClick={() => run()} disabled={state === 'loading'}>
            {state === 'loading' ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Search />
            )}
            Find opportunities
          </Button>
        </div>
      </div>

      {/* results */}
      {state === 'idle' && (
        <div className="text-muted-foreground bg-card/50 rounded-xl border border-dashed p-8 text-center text-sm">
          Enter a role above and run a search to see tailored recommendations.
        </div>
      )}

      {state === 'loading' && (
        <div className="bg-card flex flex-col gap-3 rounded-xl border p-6">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Scouting the market…
          </div>
          <div className="bg-muted h-3 w-full animate-pulse rounded" />
          <div className="bg-muted h-3 w-[85%] animate-pulse rounded" />
          <div className="bg-muted h-3 w-[60%] animate-pulse rounded" />
        </div>
      )}

      {state === 'error' && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-xl border p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}
        </div>
      )}

      {state === 'done' && (
        <div className="bg-card rounded-xl border p-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant={useResume ? 'default' : 'secondary'}>
              {useResume ? 'Tailored to resume' : 'General search'}
            </Badge>
          </div>
          <div className="text-sm">
            <AnswerText text={answer} />
          </div>
        </div>
      )}
    </div>
  )
}
