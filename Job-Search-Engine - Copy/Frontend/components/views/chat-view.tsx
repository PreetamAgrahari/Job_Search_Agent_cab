'use client'

import { ChatPanel } from '@/components/chat-panel'

export function ChatView() {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Switch between{' '}
          <span className="text-foreground font-medium">Resume AI</span> for
          grounded, resume-aware answers and{' '}
          <span className="text-foreground font-medium">Generic AI</span> for
          general career guidance.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <ChatPanel
          defaultMode="resume"
          allowModeSwitch
          placeholder="Ask about your resume, careers, or the job market…"
          suggestions={[
            'What roles best match my experience?',
            'Summarize my resume in a few sentences.',
            'What skills should I highlight for a senior role?',
            'How can I make my resume stand out?',
          ]}
        />
      </div>
    </div>
  )
}
