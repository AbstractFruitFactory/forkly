import type { Cache } from '.'
import type { FoodAPI } from '..'
import { redis } from '$lib/server/redis'
import { Err, Ok } from 'ts-results-es'

const CACHE_PREFIX = 'ingredient-search:'
const CACHE_TTL = 60 * 60 * 24 // 24 hours in seconds

export const findIngredientsCache: Cache<FoodAPI['findIngredients']> = ([query]) => ({
  set: async (response) => {
    const key = CACHE_PREFIX + query
    await redis.set(key, JSON.stringify(response), {
      ex: CACHE_TTL
    })

    return Ok(undefined)
  },

  get: async () => {
    const key = CACHE_PREFIX + query
    const cached = await redis.get(key)

    if (!cached) return Err(new Error('Cache miss'))

    return Ok(JSON.parse(cached as string))
  },

  has: async () => {
    const key = CACHE_PREFIX + query
    const exists = await redis.exists(key)

    return Ok(exists === 1)
  },
})
