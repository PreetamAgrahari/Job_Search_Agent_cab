'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { checkHealth } from '@/lib/api'

export type ViewId =
  | 'overview'
  | 'resume'
  | 'chat'
  | 'jobs'
  | 'interview'

export type HealthStatus = 'checking' | 'online' | 'offline'

export type ResumeMeta = {
  fileName: string
  sizeBytes: number
  uploadedAt: number
}

type AppContextValue = {
  view: ViewId
  setView: (v: ViewId) => void
  health: HealthStatus
  refreshHealth: () => void
  resume: ResumeMeta | null
  setResume: (r: ResumeMeta | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<ViewId>('overview')
  const [health, setHealth] = useState<HealthStatus>('checking')
  const [resume, setResume] = useState<ResumeMeta | null>(null)

  const refreshHealth = useCallback(() => {
    let cancelled = false
    setHealth('checking')
    const controller = new AbortController()
    checkHealth(controller.signal).then((ok) => {
      if (!cancelled) setHealth(ok ? 'online' : 'offline')
    })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  useEffect(() => {
    const cleanup = refreshHealth()
    const id = setInterval(refreshHealth, 30_000)
    return () => {
      cleanup?.()
      clearInterval(id)
    }
  }, [refreshHealth])

  const value = useMemo(
    () => ({ view, setView, health, refreshHealth, resume, setResume }),
    [view, health, refreshHealth, resume],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
