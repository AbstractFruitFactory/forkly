import type { Cache } from '$lib/server/food-api/cache'
import type { FoodAPI } from '$lib/server/food-api'
import { t } from './t'

export const withCache = <T extends keyof FoodAPI>(
  cache: Cache<FoodAPI[T]>
) => {
  return t.middleware(async ({ next, rawInput }) => {
    const input = [rawInput] as Parameters<FoodAPI[T]>

    if (await cache.has(input)) {
      const cached = await cache.get(input)
      return next({ ctx: { cached } })
    }

    const result = await next()
    if ('data' in result) {
      await cache.set(input, (result.data as any).value as Awaited<ReturnType<FoodAPI[T]>>)
    }
    return result
  })
}