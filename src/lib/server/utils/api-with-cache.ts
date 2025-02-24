import { andThen, ifElse } from "ramda"
import { pipe } from "ramda"
import { cache } from "../food-api/cache"
import { api } from "../food-api"
import type { FoodAPI } from "../food-api"
import { resultMap } from "$lib/utils/result"

export const apiWithCache = <T extends keyof typeof cache>(endpoint: T) => (...params: Parameters<FoodAPI[T]>) => pipe(
  () => cache[endpoint](params),
  ({ has, get, set }) => pipe(
    has,
    andThen(
      ifElse(
        (isCached) => isCached.value,
        get,
        pipe(
          () => api(endpoint)(...params),
          andThen(resultMap(res => {
            set(res)
            return res
          }))
        )
      ))
  )
)()()