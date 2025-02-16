import { Ok, Err, type Result } from 'ts-results-es'

export type SerializedResult<T> = {
  ok: boolean
  value: T | null
  error: string | null
}

export function serializeResult<T, E extends Error>(result: Result<T, E>): SerializedResult<T> {
  return {
    ok: result.isOk(),
    value: result.isOk() ? result.value : null,
    error: result.isErr() ? result.error.message : null
  }
}

export function deserializeResult<T>(serialized: SerializedResult<T>): Result<T, Error> {
  return serialized.ok 
    ? Ok(serialized.value as T)
    : Err(new Error(serialized.error || 'Unknown error'))
} 