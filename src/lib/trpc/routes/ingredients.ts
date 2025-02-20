import { t } from '../t'
import { api } from '$lib/server/food-api'
import * as v from 'valibot'
import { withCache } from '../middleware'
import { findIngredientsCache } from '$lib/server/food-api/cache/findIngredients'
import { ingredientCache } from '$lib/server/redis'
import { Ok } from 'ts-results-es'

export const ingredientsRouter = t.router({
  search: t.procedure
    .use(withCache<'findIngredients'>(findIngredientsCache))
    .input(v.parser(
      v.pipe(
        v.string(),
        v.minLength(2)
      )),
    )
    .query(async ({ input, ctx }) => {
      if (ctx.cached) return Ok(ctx.cached)

      const exactMatch = await ingredientCache.get(input)

      if (exactMatch) {
        return Ok([exactMatch])
      }

      return api('findIngredients')(input)
    }),

  cacheSelected: t.procedure
    .input(v.parser(
      v.object({
        name: v.string(),
        id: v.number()
      })))
    .mutation(async ({ input }) => {
      await ingredientCache.set(input.name, {
        name: input.name,
        id: input.id,
        custom: false
      })
      return true
    })
})