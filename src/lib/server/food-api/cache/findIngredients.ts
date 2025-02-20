import type { Cache } from '.'
import type { FoodAPI } from '..'
import { redis } from '$lib/server/redis'

const CACHE_PREFIX = 'ingredient-search:'
const CACHE_TTL = 60 * 60 * 24 // 24 hours in seconds

export const findIngredientsCache: Cache<FoodAPI['findIngredients']> = {
  set: async ([query], response) => {
    const key = CACHE_PREFIX + query
    await redis.set(key, JSON.stringify(response), {
      EX: CACHE_TTL
    })
  },

  get: async ([query]) => {
    const key = CACHE_PREFIX + query
    const cached = await redis.get(key)
    if (!cached) {
      throw new Error('Cache miss')
    }
    return JSON.parse(cached)
  },

  has: async ([query]) => {
    const key = CACHE_PREFIX + query
    return await redis.exists(key) === 1
  },

  clear: async () => {
    const keys = await redis.keys(CACHE_PREFIX + '*')
    if (keys.length > 0) {
      await redis.del(keys)
    }
  }
}
