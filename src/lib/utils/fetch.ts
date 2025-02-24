import { Err, Ok, Result } from "ts-results-es"
import pipe from "ramda/src/pipe"
import tryCatch from "ramda/src/tryCatch"
import andThen from "ramda/src/andThen"

export const safeFetch = (fetch: typeof globalThis.fetch) =>
  pipe(
    tryCatch(
      pipe(fetch, andThen(res => res.json()), andThen(data => Ok(data) as Result<unknown, Error>)),
      (error: unknown) => Promise.resolve(Err(error as Error) as Result<unknown, Error>)
    )
  )