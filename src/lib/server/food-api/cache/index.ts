import type { FoodAPI } from '..'
import { findIngredientsCache } from './findIngredients'

export type Cache<
  ApiCall extends FoodAPI[keyof FoodAPI],
  Params = Parameters<ApiCall>,
  Response = Awaited<ReturnType<ApiCall>>
> = {
  set: (params: Params, response: Response) => Promise<void>
  get: (params: Params) => Promise<Response>
  has: (params: Params) => Promise<boolean>
  clear: () => Promise<void>
}

export type ApiCache = {
  [apiCall in keyof FoodAPI]?: Cache<(FoodAPI)[apiCall]>
}

export const cache: ApiCache = {
  findIngredients: findIngredientsCache
}
