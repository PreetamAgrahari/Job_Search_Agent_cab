'use client'

import { useCallback, useRef, useState } from 'react'
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadResume, ApiError } from '@/lib/api'
import { useApp } from '@/components/app-provider'
import { Button } from '@/components/ui/button'

type Status = 'idle' | 'uploading' | 'success' | 'error'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ResumeUploader() {
  const { resume, setResume } = useApp()
  const [status, setStatus] = useState<Status>(resume ? 'success' : 'idle')
  const [message, setMessage] = useState<string>('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setStatus('error')
        setMessage('Please upload a PDF file.')
        return
      }
      setStatus('uploading')
      setMessage('')
      try {
        const res = await uploadResume(file)
        setResume({
          fileName: file.name,
          sizeBytes: file.size,
          uploadedAt: Date.now(),
        })
        setStatus('success')
        setMessage(res.message || 'Resume uploaded successfully.')
      } catch (err) {
        setStatus('error')
        setMessage(
          err instanceof ApiError ? err.message : 'Upload failed. Try again.',
        )
      }
    },
    [setResume],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  if (status === 'success' && resume) {
    return (
      <div className="bg-card rounded-xl border p-5">
        <div className="flex items-start gap-4">
          <div className="bg-success/12 text-success flex size-11 shrink-0 items-center justify-center rounded-lg">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{resume.fileName}</p>
              <CheckCircle2 className="text-success size-4 shrink-0" />
            </div>
            <p className="text-muted-foreground mt-0.5 font-mono text-xs">
              {formatBytes(resume.sizeBytes)} · indexed{' '}
              {new Date(resume.uploadedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {message && (
              <p className="text-success mt-2 text-xs">{message}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setResume(null)
              setStatus('idle')
              setMessage('')
            }}
          >
            <X /> Replace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        'bg-card flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
        dragging ? 'border-primary bg-accent/50' : 'border-border',
        status === 'error' && 'border-destructive/50',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div
        className={cn(
          'mb-4 flex size-14 items-center justify-center rounded-full',
          status === 'uploading'
            ? 'bg-primary/10 text-primary'
            : status === 'error'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary',
        )}
      >
        {status === 'uploading' ? (
          <Loader2 className="size-6 animate-spin" />
        ) : status === 'error' ? (
          <AlertTriangle className="size-6" />
        ) : (
          <UploadCloud className="size-6" />
        )}
      </div>

      <h3 className="text-base font-semibold tracking-tight">
        {status === 'uploading'
          ? 'Uploading & indexing…'
          : 'Upload your resume'}
      </h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm text-pretty">
        {status === 'uploading'
          ? 'Parsing your PDF and building a searchable index for the agent.'
          : 'Drag & drop a PDF here, or browse. The agent uses it to give grounded, resume-aware answers.'}
      </p>

      {status === 'error' && message && (
        <p className="text-destructive mt-3 flex items-center gap-1.5 text-sm">
          <AlertTriangle className="size-4" /> {message}
        </p>
      )}

      <div className="mt-5 flex items-center gap-2">
        <Button
          onClick={() => inputRef.current?.click()}
          disabled={status === 'uploading'}
        >
          <UploadCloud /> Browse files
        </Button>
      </div>
      <p className="text-muted-foreground/70 mt-3 font-mono text-[11px]">
        PDF · up to ~10MB
      </p>
    </div>
  )
}
