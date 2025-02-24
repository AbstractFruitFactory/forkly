import tryCatch from "ramda/src/tryCatch"
import pipe from "ramda/src/pipe"
import { Err, Ok, Result } from "ts-results-es"
import { parse } from "valibot"

export const validate = pipe(
  tryCatch(
    parse,
    Err
  ),
  Ok as <T>(result: T) => Result<T, Error>
)