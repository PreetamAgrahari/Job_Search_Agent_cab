'use client'

import {
  FileText,
  MessagesSquare,
  Briefcase,
  Mic,
  ArrowRight,
  CheckCircle2,
  Circle,
  Radar,
} from 'lucide-react'
import { useApp, type ViewId } from '@/components/app-provider'
import { Badge } from '@/components/ui/badge'

const FEATURES: {
  id: ViewId
  title: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    id: 'resume',
    title: 'Resume Intelligence',
    desc: 'Upload a PDF and get an instant, AI-generated breakdown of strengths, skills, and gaps.',
    icon: FileText,
  },
  {
    id: 'chat',
    title: 'AI Assistant',
    desc: 'Chat with a resume-aware agent or ask general career questions in generic mode.',
    icon: MessagesSquare,
  },
  {
    id: 'jobs',
    title: 'Job Search',
    desc: 'Discover roles that match your background and generate tailored search strategies.',
    icon: Briefcase,
  },
  {
    id: 'interview',
    title: 'Interview Prep',
    desc: 'Generate likely questions from your resume and practice with instant feedback.',
    icon: Mic,
  },
]

export function OverviewView() {
  const { setView, resume, health } = useApp()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      {/* hero */}
      <div className="from-primary to-primary/80 relative overflow-hidden rounded-2xl bg-gradient-to-br p-8 text-primary-foreground">
        <div className="relative z-10 max-w-xl">
          <Badge className="border-transparent bg-white/15 text-primary-foreground">
            <Radar className="size-3" /> AI Career Agent
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
            Land your next role, with an agent in your corner.
          </h1>
          <p className="mt-2 text-sm/relaxed text-primary-foreground/80 text-pretty">
            Upload your resume and let the agent analyze it, answer questions,
            surface matching jobs, and drill you for interviews — all grounded
            in your real experience.
          </p>
          <button
            type="button"
            onClick={() => setView(resume ? 'chat' : 'resume')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-4 py-2.5 text-sm font-medium text-primary transition-transform hover:-translate-y-0.5"
          >
            {resume ? 'Chat with the agent' : 'Upload your resume'}
            <ArrowRight className="size-4" />
          </button>
        </div>
        <Radar
          className="absolute -right-8 -bottom-10 size-56 text-primary-foreground/10"
          strokeWidth={1}
        />
      </div>

      {/* status checklist */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatusTile
          label="Backend"
          value={
            health === 'online'
              ? 'Connected'
              : health === 'offline'
                ? 'Not reachable'
                : 'Checking…'
          }
          ok={health === 'online'}
        />
        <StatusTile
          label="Resume"
          value={resume ? 'Uploaded & indexed' : 'Not uploaded'}
          ok={!!resume}
        />
        <StatusTile
          label="Agent mode"
          value={resume ? 'Resume-aware' : 'Generic only'}
          ok={!!resume}
        />
      </div>

      {/* features */}
      <div>
        <h2 className="text-muted-foreground mb-3 font-mono text-xs tracking-widest uppercase">
          Capabilities
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setView(f.id)}
                className="group bg-card hover:border-primary/40 flex flex-col items-start rounded-xl border p-5 text-left transition-colors"
              >
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-3 flex items-center gap-1.5 text-sm font-semibold">
                  {f.title}
                  <ArrowRight className="text-muted-foreground group-hover:text-primary size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="text-muted-foreground mt-1 text-sm text-pretty">
                  {f.desc}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatusTile({
  label,
  value,
  ok,
}: {
  label: string
  value: string
  ok: boolean
}) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-xl border p-4">
      {ok ? (
        <CheckCircle2 className="text-success size-5 shrink-0" />
      ) : (
        <Circle className="text-muted-foreground size-5 shrink-0" />
      )}
      <div>
        <p className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
