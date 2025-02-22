import { t } from './t'
import { ingredientsRouter } from './routes/ingredients'
import { authRouter } from './routes/auth'
import { recipesRouter } from './routes/recipes'
import { profileRouter } from './routes/profile'

export const appRouter = t.router({
  ingredients: ingredientsRouter,
  auth: authRouter,
  recipes: recipesRouter,
  profile: profileRouter
})

export type AppRouter = typeof appRouter 