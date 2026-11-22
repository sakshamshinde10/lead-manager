// One small wrapper around fetch that every part of the app uses to talk to
// the backend. It does three jobs so no other file has to:
//   1. adds the login token to every request
//   2. turns failures into one predictable error type (ApiError)
//   3. tells the rest of the app when the token is no longer valid

// A trailing slash in VITE_API_URL is removed so we never request "//api/...".
const BASE_URL = `${(import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')}/api`
const TOKEN_KEY = 'lead-manager-token'

export const AUTH_EXPIRED_EVENT = 'auth:expired'

// localStorage can throw (private mode, blocked storage), so every access is guarded.
export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* ignore: the user simply has to log in again next time */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  },
}

// The error shape the whole UI relies on. It mirrors the backend response:
// { message, errors?: { field: "message" } }
export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// Turns a failed response into an ApiError (the one error type the UI knows).
// A 401 while we HAD a token means it expired or was revoked: tell the app to
// log out. (A 401 on the login form has no token yet, so it is ignored.)
async function failure(response, token, parsed) {
  const data = parsed === undefined ? await response.json().catch(() => null) : parsed
  if (response.status === 401 && token) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
  return new ApiError(response.status, data?.message ?? 'Something went wrong', data?.errors)
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const token = tokenStore.get()
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    // A cancelled request (for example an outdated search) is not an error.
    if (error.name === 'AbortError') throw error
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }

  // 204 means success with no body (used by delete).
  if (response.status === 204) return null

  const data = await response.json().catch(() => null)
  if (!response.ok) throw await failure(response, token, data)
  return data
}

// Downloads a file from the API (for example the Excel export) and makes the
// browser save it. It needs its own function because the response is a file,
// not JSON, and the login token still has to be sent.
async function download(path, fallbackName) {
  const token = tokenStore.get()
  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }

  if (!response.ok) throw await failure(response, token)

  // The server names the file (with today's date); use that name when present.
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? fallbackName

  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const api = {
  download,
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
