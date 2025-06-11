import { cache } from '../food-api/cache'
import { api } from '../food-api'
import type { FoodAPI } from '../food-api'

export const apiWithCache = <T extends keyof typeof cache>(endpoint: T) =>
  async (...params: Parameters<FoodAPI[T]>) => {
    const { has, get, set } = cache[endpoint](params)

    const cached = await has()
    if (cached.value) {
      return get()
    }

    const result = await api(endpoint)(...params)
    if (result.ok) {
      await set(result.value)
    }

    return result
  }
