/**
 * api.js — single place that knows how to talk to the FastAPI backend.
 *
 * In dev, Vite serves the UI on :5173 while FastAPI runs on :8000, so we hit
 * it directly. In production the UI is served by the same origin as the API.
 */

export const API_BASE = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api'

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{ retryable?: boolean, retryWithPlain?: boolean }} [opts]
   *   retryWithPlain: the streaming route is unavailable on this host; the same
   *   request made against the plain endpoint will very likely work.
   */
  constructor(message, { retryable = false, retryWithPlain = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.retryable = retryable
    this.retryWithPlain = retryWithPlain
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

/** Turn an HTTP failure into the most useful message we can. */
const describeFailure = (status, detail) => {
  if (isRateLimit(status, detail)) return new ApiError(RATE_LIMIT_HELP, { retryable: true })
  if (isMissingKey(detail)) return new ApiError(KEY_HELP)
  return new ApiError(detail)
}

async function readError(res) {
  let detail = `Server error ${res.status}`
  try {
    const body = await res.json()
    detail = body?.detail || detail
  } catch {
    /* non-JSON error body — keep the generic message */
  }
  return detail
}

/**
 * Run the four-agent pipeline in one request.
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

  if (!res.ok) throw describeFailure(res.status, await readError(res))

  return res.json()
}

/**
 * The same pipeline, reporting each asset as it lands.
 *
 * The server writes newline-delimited JSON: stage events while the work runs,
 * then one result event. The caller gets to show real progress instead of a
 * spinner — and if the host will not stream (some serverless runtimes buffer or
 * reject streaming responses outright) the error carries `retryWithPlain` so
 * the caller can quietly repeat the request against /generate.
 *
 * @param {string} rawJd
 * @param {{ onStage?: (event: object) => void, signal?: AbortSignal }} [opts]
 * @returns {Promise<object>} the same payload requestKit returns
 */
export async function streamKit(rawJd, { onStage, signal } = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}/generate/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_jd: rawJd }),
      signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError(OFFLINE_HELP, { retryWithPlain: true })
  }

  if (!res.ok || !res.body) {
    const detail = await readError(res)
    // No streaming route on this host, or a gateway that refuses to pass one
    // through. Worth exactly one silent retry, not an error message.
    if ([404, 405, 500, 501, 502].includes(res.status) || !res.body) {
      throw new ApiError(detail, { retryWithPlain: true })
    }
    throw describeFailure(res.status, detail)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let result = null
  let failure = null

  const handleLine = (line) => {
    const text = line.trim()
    if (!text) return
    let event
    try {
      event = JSON.parse(text)
    } catch {
      return // a partial or malformed line is not worth failing the run over
    }
    if (event.type === 'stage' || event.type === 'retry') onStage?.(event)
    else if (event.type === 'result') result = event.data
    else if (event.type === 'error') failure = event.message
  }

  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    lines.forEach(handleLine)
  }
  handleLine(buffer)

  if (failure) throw describeFailure(0, failure)
  if (!result) throw new ApiError('The server stopped before finishing the kit.', { retryWithPlain: true })

  return result
}

/**
 * Re-run a single asset with one model call, instead of the whole pipeline.
 *
 * @param {{
 *   asset: string,
 *   rawJd: string,
 *   cleanJd?: object,
 *   booleans?: object,
 *   signal?: AbortSignal,
 * }} args
 * @returns {Promise<object>} { asset, ...the regenerated slice }
 */
export async function regenerateAsset({ asset, rawJd, cleanJd, booleans, signal }) {
  let res
  try {
    res = await fetch(`${API_BASE}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset,
        raw_jd: rawJd,
        clean_jd: cleanJd ?? null,
        booleans: booleans ?? null,
      }),
      signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError(OFFLINE_HELP)
  }

  if (!res.ok) throw describeFailure(res.status, await readError(res))

  return res.json()
}

/**
 * Read a job description out of an uploaded PDF, Word document or text file.
 *
 * The file itself is the request body with its name in X-Filename, rather than
 * multipart form data — one fewer dependency on both sides, and the browser
 * streams the file instead of base64-inflating it.
 *
 * @param {File} file
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<{ text: string, source: string, chars: number, warning: string | null }>}
 */
export async function ingestFile(file, { signal } = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}/ingest/file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Filename': file.name,
      },
      body: file,
      signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError(OFFLINE_HELP)
  }

  if (!res.ok) throw describeFailure(res.status, await readError(res))

  return res.json()
}

/**
 * How long to wait for /health before calling the backend unreachable.
 *
 * A sleeping serverless backend takes 10-20s to answer its very first request.
 * A short timeout would therefore report a *cold* backend as a *broken* one and
 * tell the user to give up on a server that was about to answer. We wait long
 * enough for a real cold start; while it is in flight the UI says so.
 */
export const COLD_START_HINT = 'about 20 seconds'
const HEALTH_TIMEOUT_MS = 25000

/**
 * Backend reachability probe.
 *
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<{ ok: boolean }>}
 */
export async function checkHealth({ signal } = {}) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort)

  const timer = setTimeout(abort, HEALTH_TIMEOUT_MS)
  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
      cache: 'no-store',
    })
    return { ok: res.ok }
  } catch {
    return { ok: false }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
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
