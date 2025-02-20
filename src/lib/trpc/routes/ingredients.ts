import { t } from '../t'
import { api } from '$lib/server/food-api'
import * as v from 'valibot'
import { withCache } from '../middleware'
import { findIngredientsCache } from '$lib/server/food-api/cache/findIngredients'

export const ingredientsRouter = t.router({
  search: t.procedure
    .use(withCache<'findIngredients'>(findIngredientsCache))
    .input(v.parser(
      v.pipe(
        v.string(),
        v.minLength(2)
      )),
    )
    .query(({ input }) => api('findIngredients')(input))
})