import { createClient } from '@redis/client'
// import { REDIS_URL } from '$env/static/private'
import type { IngredientSearchResult } from './food-api'

const redis = createClient({
  url: process.env.REDIS_URL
})

redis.on('error', (err: Error) => console.error('Redis Client Error', err))

await redis.connect()

const INGREDIENT_CACHE_PREFIX = 'ingredient:'
const INGREDIENT_CACHE_TTL = 60 * 60 * 24 // 24 hours

export const ingredientCache = {
  set: async (name: string, ingredient: IngredientSearchResult[0]) => {
    const key = INGREDIENT_CACHE_PREFIX + name.toLowerCase()
    await redis.set(key, JSON.stringify(ingredient), {
      EX: INGREDIENT_CACHE_TTL
    })
  },

  get: async (name: string): Promise<IngredientSearchResult[0] | null> => {
    const key = INGREDIENT_CACHE_PREFIX + name.toLowerCase()
    const cached = await redis.get(key)
    if (!cached) {
      return null
    }
    return JSON.parse(cached)
  }
}

export { redis } 