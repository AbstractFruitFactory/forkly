import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { recipe } from '$lib/server/db/schema'
import { eq, desc } from 'drizzle-orm'

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const recipes = await db
    .select()
    .from(recipe)
    .where(eq(recipe.userId, locals.user.id))
    .orderBy(desc(recipe.createdAt))

  return json(recipes)
} 