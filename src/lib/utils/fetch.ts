import { Err, Ok, Result } from "ts-results-es"
import pipe from "ramda/src/pipe"
import tryCatch from "ramda/src/tryCatch"
import andThen from "ramda/src/andThen"

export const safeFetch = <T>(_fetch: typeof globalThis.fetch = fetch) =>
  pipe(
    tryCatch(
      pipe(_fetch, andThen(res => res.json()), andThen(data => Ok(data) as Result<T, Error>)),
      (error: unknown) => Promise.resolve(Err(error as Error) as Result<T, Error>)
    )
  )