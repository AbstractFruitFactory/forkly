import { Err, Ok, Result } from "ts-results-es"

export const safeFetch = <T>(_fetch: typeof globalThis.fetch = fetch) => async (...args: Parameters<typeof fetch>) => {
  const response = await _fetch(...args)
  const data = await response.json()

  if (!response.ok) {
    return Err(new Error(data.error || data.message || 'Request failed')) as Result<T, Error>
  }

  return Ok(data) as Result<T, Error>
} 
