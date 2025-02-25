import { error, json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { recipe, recipeLike } from '$lib/server/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized')

	const recipeId = params.id

	// Get current recipe
	const recipes = await db
		.select({
			id: recipe.id,
			likes: sql<number>`count(${recipeLike.userId})::int`
		})
		.from(recipe)
		.leftJoin(recipeLike, eq(recipe.id, recipeLike.recipeId))
		.where(eq(recipe.id, recipeId))
		.groupBy(recipe.id)

	if (recipes.length === 0) {
		throw error(404, 'Recipe not found')
	}

	// Check if user has already liked the recipe
	const existingLike = await db
		.select()
		.from(recipeLike)
		.where(
			and(eq(recipeLike.recipeId, recipeId), eq(recipeLike.userId, locals.user.id))
		)

	if (existingLike.length > 0) {
		// Unlike
		await db.delete(recipeLike).where(
			and(eq(recipeLike.recipeId, recipeId), eq(recipeLike.userId, locals.user.id))
		)
		return json({ liked: false })
	} else {
		// Like
		await db.insert(recipeLike).values({
			userId: locals.user.id,
			recipeId
		})
		return json({ liked: true })
	}
} 