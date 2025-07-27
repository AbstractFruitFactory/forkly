import { Redis } from '@upstash/redis'
import type { IngredientSearchResult } from './food-api'
import dotenv from 'dotenv'

dotenv.config()

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
})

const INGREDIENT_CACHE_PREFIX = 'ingredient:'
const INGREDIENT_CACHE_TTL = 60 * 60 * 24 // 24 hours

export const ingredientCache = {
  set: async (name: string, ingredient: IngredientSearchResult[0]) => {
    const key = INGREDIENT_CACHE_PREFIX + name.toLowerCase()
    await redis.set(key, JSON.stringify(ingredient), {
      ex: INGREDIENT_CACHE_TTL
    })
  },

  get: async (name: string): Promise<IngredientSearchResult[0] | null> => {
    const key = INGREDIENT_CACHE_PREFIX + name.toLowerCase()
    const cached = await redis.get(key)
    if (!cached) {
      return null
    }
    return JSON.parse(cached as string)
  }
}

export { redis } 