'use client'

import { Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/components/app-provider'
import { API_BASE_URL } from '@/lib/api'

export function HealthIndicator() {
  const { health, refreshHealth } = useApp()

  const dot =
    health === 'online'
      ? 'bg-success'
      : health === 'offline'
        ? 'bg-destructive'
        : 'bg-muted-foreground'

  const label =
    health === 'online'
      ? 'Backend online'
      : health === 'offline'
        ? 'Backend offline'
        : 'Checking…'

  return (
    <div className="rounded-lg border bg-background/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {health === 'checking' ? (
            <Loader2 className="text-muted-foreground size-3 animate-spin" />
          ) : (
            <span className="relative flex size-2.5">
              {health === 'online' && (
                <span className="bg-success/60 absolute inline-flex size-full animate-ping rounded-full" />
              )}
              <span
                className={cn('relative inline-flex size-2.5 rounded-full', dot)}
              />
            </span>
          )}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <button
          type="button"
          onClick={() => refreshHealth()}
          aria-label="Recheck backend status"
          className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
        >
          <RefreshCw className="size-3.5" />
        </button>
      </div>
      <p className="text-muted-foreground/70 mt-1.5 truncate font-mono text-[10px]">
        {API_BASE_URL.replace(/^https?:\/\//, '')}
      </p>
    </div>
  )
}
