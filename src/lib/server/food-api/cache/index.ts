import type { Ok, Result } from 'ts-results-es'
import type { FoodAPI } from '..'
import { findIngredientsCache } from './findIngredients'

export type Cache<
  ApiCall extends FoodAPI[keyof FoodAPI],
  Params = Parameters<ApiCall>,
  Response = Awaited<ReturnType<ApiCall>>
> = (params: Params) => ({
  set: (response: Response) => Promise<Result<void, Error>>
  get: () => Promise<Result<Response, Error>>
  has: () => Promise<Ok<boolean>>
})

export type ApiCache = {
  [apiCall in keyof FoodAPI]?: Cache<(FoodAPI)[apiCall]>
}

export const cache = {
  findIngredients: findIngredientsCache
} as const satisfies ApiCache
