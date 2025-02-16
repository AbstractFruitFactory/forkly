import { Err, Ok, type Result } from "ts-results-es"

export const resultTransformer = {
  input: {
    serialize: (obj: unknown) => obj,
    deserialize: (obj: unknown) => obj,
  },
  output: {
    serialize: (obj: unknown) => {
      if (obj && typeof obj === 'object' && 'isOk' in obj) {
        const result = obj as Result<unknown, Error>
        return result.isOk()
          ? { ok: true, value: result.value }
          : { ok: false, error: result.error.message }
      }
      return obj
    },
    deserialize: (obj: unknown) => {
      console.log('deserialize', obj)
      if (obj && typeof obj === 'object' && 'ok' in obj) {
        return (obj as any).ok
          ? Ok((obj as any).value)
          : Err(new Error((obj as any).error))
      }
      return obj
    },
  },
}