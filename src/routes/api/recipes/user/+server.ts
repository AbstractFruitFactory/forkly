import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { recipe, recipeLike } from '$lib/server/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const recipes = await db
    .select({
      id: recipe.id,
      userId: recipe.userId,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      nutrition: recipe.nutrition,
      imageUrl: recipe.imageUrl,
      createdAt: recipe.createdAt,
      likes: sql<number>`count(${recipeLike.userId})::int`
    })
    .from(recipe)
    .leftJoin(recipeLike, eq(recipe.id, recipeLike.recipeId))
    .where(eq(recipe.userId, locals.user.id))
    .groupBy(recipe.id)
    .orderBy(desc(recipe.createdAt))

  return json(recipes)
} 