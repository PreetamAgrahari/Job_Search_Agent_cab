'use client'

import { useState } from 'react'
import { Menu, X, Radar } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Sidebar } from '@/components/sidebar'
import { OverviewView } from '@/components/views/overview-view'
import { ResumeView } from '@/components/views/resume-view'
import { ChatView } from '@/components/views/chat-view'
import { JobsView } from '@/components/views/jobs-view'
import { InterviewView } from '@/components/views/interview-view'

export function DashboardShell() {
  const { view } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="bg-background text-foreground flex h-dvh overflow-hidden">
      {/* desktop sidebar */}
      <aside className="hidden shrink-0 md:block">
        <Sidebar />
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="bg-foreground/40 absolute inset-0"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-xl">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile topbar */}
        <header className="flex items-center gap-3 border-b px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            className="hover:bg-accent rounded-md p-1.5"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
              <Radar className="size-4" />
            </div>
            <span className="text-sm font-semibold">Hireloop</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          {view === 'overview' && <OverviewView />}
          {view === 'resume' && <ResumeView />}
          {view === 'chat' && <ChatView />}
          {view === 'jobs' && <JobsView />}
          {view === 'interview' && <InterviewView />}
        </main>
      </div>
    </div>
  )
}
