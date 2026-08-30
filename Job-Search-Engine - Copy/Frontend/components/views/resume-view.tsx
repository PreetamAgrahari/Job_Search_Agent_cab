'use client'

import { useApp } from '@/components/app-provider'
import { ResumeUploader } from '@/components/resume-uploader'
import { ResumeAnalysis } from '@/components/resume-analysis'

export function ResumeView() {
  const { resume } = useApp()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resume</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload your resume as a PDF. The agent parses and indexes it so every
          answer is grounded in your real experience.
        </p>
      </div>

      <ResumeUploader />

      {resume && <ResumeAnalysis />}
    </div>
  )
}
