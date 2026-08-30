'use client'

import {
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Briefcase,
  Mic,
  Radar,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp, type ViewId } from '@/components/app-provider'
import { HealthIndicator } from '@/components/health-indicator'

const NAV: {
  id: ViewId
  label: string
  icon: React.ComponentType<{ className?: string }>
  hint: string
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, hint: 'Home' },
  { id: 'resume', label: 'Resume', icon: FileText, hint: 'Upload & analyze' },
  { id: 'chat', label: 'AI Assistant', icon: MessagesSquare, hint: 'Ask anything' },
  { id: 'jobs', label: 'Job Search', icon: Briefcase, hint: 'Find roles' },
  { id: 'interview', label: 'Interview Prep', icon: Mic, hint: 'Practice' },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { view, setView, resume } = useApp()

  return (
    <div className="bg-sidebar text-sidebar-foreground flex h-full w-64 flex-col border-r">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
          <Radar className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Hireloop</p>
          <p className="text-muted-foreground font-mono text-[10px] tracking-wide uppercase">
            AI Job Agent
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2">
        <p className="text-muted-foreground px-3 pb-2 font-mono text-[10px] tracking-widest uppercase">
          Workspace
        </p>
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = view === item.id
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setView(item.id)
                    onNavigate?.()
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === 'resume' && resume ? (
                    <CheckCircle2 className="text-success size-4" />
                  ) : (
                    <span
                      className={cn(
                        'text-muted-foreground/60 font-mono text-[10px] opacity-0 transition-opacity group-hover:opacity-100',
                        active && 'opacity-100',
                      )}
                    >
                      {item.hint}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t p-4">
        <HealthIndicator />
      </div>
    </div>
  )
}
