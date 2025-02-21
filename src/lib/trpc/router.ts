import { t } from './t'
import { ingredientsRouter } from './routes/ingredients'
import { authRouter } from './routes/auth'

export const appRouter = t.router({
  ingredients: ingredientsRouter,
  auth: authRouter
})

export type AppRouter = typeof appRouter 