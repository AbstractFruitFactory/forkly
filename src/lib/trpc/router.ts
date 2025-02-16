import { t } from './t'
import { ingredientsRouter } from './routes/ingredients'

export const appRouter = t.router({
  ingredients: ingredientsRouter
})

export type AppRouter = typeof appRouter 