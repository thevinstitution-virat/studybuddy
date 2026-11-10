/**
 * What an API response may say about an unexpected error.
 *
 * An Error's message can carry SQL text, table and column names, file paths and upstream URLs. Routes used
 * to return it to the caller (`details: error.message`), which hands an attacker a map of the internals.
 * In production the caller gets nothing specific; the route must log the real error server-side.
 * Outside production the message is returned, because it is useful while developing.
 *
 * Validation feedback (for example zod `issues` on a 400) is not an unexpected error and does not belong
 * here: the caller needs it to fix the request.
 */

const isProduction = () => process.env.NODE_ENV === 'production'

/** For a `details` field: the message while developing, omitted (undefined) in production. */
export function publicErrorDetails(error: unknown): string | undefined {
  if (isProduction()) return undefined
  return error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error'
}

/** For an `error` / `message` field on a 5xx: the message while developing, `fallback` in production. */
export function publicErrorMessage(error: unknown, fallback: string): string {
  if (isProduction()) return fallback
  return error instanceof Error && error.message ? error.message : fallback
}
