import { t } from '../t'
import { api } from '$lib/server/food-api'
import * as v from 'valibot'

export const ingredientsRouter = t.router({
  search: t.procedure
    .input(v.parser(
      v.pipe(
        v.string(),
        v.minLength(2)
      )),
    )
    .query(({ input }) => api.findIngredients(input))
})