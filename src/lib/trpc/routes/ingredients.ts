import { t } from '../t'
import { api } from '$lib/server/food-api'
import * as v from 'valibot'

export const ingredientsRouter = t.router({
  search: t.procedure
    .input((value: unknown) => {
      return v.parse(
        v.pipe(
          v.string(),
          v.minLength(2)
        ), value)
    })
    .query(({ input }) => api.findIngredients(input))
}) 