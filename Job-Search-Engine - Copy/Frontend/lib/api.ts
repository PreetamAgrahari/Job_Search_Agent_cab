// Client for the existing FastAPI backend.
// Override the default by setting NEXT_PUBLIC_API_URL.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000'

export type AiMode = 'resume' | 'generic'

export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function friendlyNetworkError(err: unknown): never {
  if (err instanceof ApiError) throw err
  throw new ApiError(
    `Could not reach the backend at ${API_BASE_URL}. Make sure the FastAPI server is running.`,
  )
}

/** GET /api/health */
export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal,
    })
    return res.ok
  } catch {
    return false
  }
}

export type UploadResult = {
  ok: boolean
  message?: string
  raw?: unknown
}

/** POST /api/resume/upload (multipart form-data with a single "file" field) */
export async function uploadResume(file: File): Promise<UploadResult> {
  const form = new FormData()
  form.append('file', file)

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
      method: 'POST',
      body: form,
    })
  } catch (err) {
    friendlyNetworkError(err)
  }

  const data = await safeJson(res)
  if (!res.ok) {
    throw new ApiError(
      extractMessage(data) || `Upload failed (HTTP ${res.status})`,
      res.status,
    )
  }
  return {
    ok: true,
    message: extractMessage(data) || 'Resume uploaded and indexed successfully.',
    raw: data,
  }
}

export type AskResult = {
  answer: string
  sources?: unknown[]
  raw?: unknown
}

/** POST /api/resume/ask */
export async function askAgent(
  question: string,
  mode: AiMode,
  topK = 3,
  signal?: AbortSignal,
): Promise<AskResult> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/api/resume/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, mode, top_k: topK }),
      signal,
    })
  } catch (err) {
    friendlyNetworkError(err)
  }

  const data = await safeJson(res)
  if (!res.ok) {
    throw new ApiError(
      extractMessage(data) || `Request failed (HTTP ${res.status})`,
      res.status,
    )
  }

  return {
    answer: extractAnswer(data),
    sources: extractSources(data),
    raw: data,
  }
}

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function extractMessage(data: unknown): string | undefined {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    const candidate = d.message ?? d.detail ?? d.error
    if (typeof candidate === 'string') return candidate
  }
  return undefined
}

function extractAnswer(data: unknown): string {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    const candidate =
      d.answer ?? d.response ?? d.result ?? d.text ?? d.message ?? d.output
    if (typeof candidate === 'string') return candidate
    if (candidate != null) return JSON.stringify(candidate, null, 2)
  }
  return 'No answer was returned by the backend.'
}

function extractSources(data: unknown): unknown[] | undefined {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    const s = d.sources ?? d.context ?? d.chunks ?? d.documents
    if (Array.isArray(s)) return s
  }
  return undefined
}
