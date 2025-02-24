import type { Result } from "ts-results-es"

export const resultMap = <T, U>(fn: (value: T) => U) => (result: Result<T, Error>): Result<U, Error> => result.map(fn)