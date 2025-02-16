import type { Context } from './context'
import { initTRPC } from '@trpc/server'
import { resultTransformer } from './transformers'

export const t = initTRPC.context<Context>().create({
  transformer: resultTransformer,
}) 