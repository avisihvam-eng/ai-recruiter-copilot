/**
 * api.js — single place that knows how to talk to the FastAPI backend.
 *
 * In dev, Vite serves the UI on :5173 while FastAPI runs on :8000, so we hit
 * it directly. In production the UI is served by the same origin as the API.
 */

export const API_BASE = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api'

export class ApiError extends Error {
  constructor(message, { retryable = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.retryable = retryable
  }
}

const OFFLINE_HELP =
  'Could not reach the backend. Running locally? Start it with ' +
  '`uvicorn backend.main:app --port 8000` and try again.'

const RATE_LIMIT_HELP =
  'Gemini\u2019s free tier allows only a few requests per minute. ' +
  'Wait about 10 seconds, then run it again.'

const KEY_HELP =
  'No Gemini API key is configured on the server. Add GOOGLE_API_KEY to backend/.env (local) ' +
  'or to your Vercel environment variables, then restart.'

const isRateLimit = (status, detail) =>
  status === 429 || detail.includes('429') || detail.includes('RESOURCE_EXHAUSTED')

const isMissingKey = (detail) => /api key/i.test(detail) && /no gemini|not (?:set|provided|configured)/i.test(detail)

/**
 * Run the four-agent pipeline.
 * @param {string} rawJd  full job description text
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<object>} the GenerateResponse payload
 */
export async function requestKit(rawJd, { signal } = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_jd: rawJd }),
      signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError(OFFLINE_HELP)
  }

  if (!res.ok) {
    let detail = `Server error ${res.status}`
    try {
      const body = await res.json()
      detail = body?.detail || detail
    } catch {
      /* non-JSON error body — keep the generic message */
    }

    if (isRateLimit(res.status, detail)) throw new ApiError(RATE_LIMIT_HELP, { retryable: true })
    if (isMissingKey(detail)) throw new ApiError(KEY_HELP)
    throw new ApiError(detail)
  }

  return res.json()
}

/**
 * Lightweight backend reachability probe, used by the header indicator so the
 * UI can tell the user the backend is down *before* they paste a JD and fail.
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

/** Month names + timestamp for "Generated" metadata. */
export function stampNow() {
  return new Date().toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
