import { t } from './t'
import { ingredientsRouter } from './routes/ingredients'
import { authRouter } from './routes/auth'
import { recipesRouter } from './routes/recipes'

export const appRouter = t.router({
  ingredients: ingredientsRouter,
  auth: authRouter,
  recipes: recipesRouter
})

export type AppRouter = typeof appRouter 