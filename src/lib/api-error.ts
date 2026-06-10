/**
 * Strongly-typed helpers for extracting user-facing messages out of Axios /
 * fetch errors that come back from the Django REST API.
 *
 * The previous codebase used `error: any` in catch blocks and `onError`
 * callbacks. That is unsafe with `strict` TS and silently masked typos in
 * field names. These helpers narrow `unknown` to the few shapes the backend
 * actually returns and never throw.
 */

/** Subset of an AxiosError we care about for surfacing messages. */
export interface ApiErrorLike {
  response?: {
    status?: number
    data?: unknown
  }
  message?: string
}

/** Type guard: is this value object-like (not null, not primitive)? */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Pluck the first string value out of an unknown thing that might be a string,
 *  string[] or { 0: string } shape used by DRF field-level errors. */
function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    const first = value[0]
    return typeof first === 'string' ? first : undefined
  }
  return undefined
}

/**
 * Extract a single human-readable error message from any API-shaped error.
 *
 * Lookup order (first match wins):
 *   1. response.data.detail        — DRF's default error key
 *   2. response.data.message       — custom services
 *   3. response.data.non_field_errors[0]
 *   4. response.data[fieldKey][0]  — first DRF field error, if `fieldKey` given
 *   5. error.message               — generic JS Error message
 *   6. fallback                    — caller-supplied default
 */
export function extractApiErrorMessage(
  error: unknown,
  fallback: string,
  fieldKey?: string
): string {
  if (!isRecord(error)) {
    return typeof error === 'string' ? error : fallback
  }

  // Axios-shaped: { response: { data: ... } }
  const response = isRecord(error.response) ? error.response : undefined
  const data = response && isRecord(response.data) ? response.data : undefined

  if (data) {
    const detail = firstString(data.detail)
    if (detail) return detail

    const message = firstString(data.message)
    if (message) return message

    const nonField = firstString(data.non_field_errors)
    if (nonField) return nonField

    if (fieldKey) {
      const fieldErr = firstString(data[fieldKey])
      if (fieldErr) return fieldErr
    }
  }

  // Plain Error.message
  const errMessage = typeof error.message === 'string' ? error.message : ''
  if (errMessage) return errMessage

  return fallback
}
