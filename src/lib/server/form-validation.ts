import type { BaseSchema } from 'valibot'
import { safeParse } from 'valibot'
import { Ok, Err, type Result } from 'ts-results-es'

export function validate<T extends BaseSchema<any, any, any>>(
  schema: T
): (input: unknown) => Result<any, Error> {
  return (input: unknown) => {
    const result = safeParse(schema, input)
    if (result.success) {
      return Ok(result.output)
    }
    return Err(new Error(result.issues[0]?.message || 'Validation failed'))
  }
}
