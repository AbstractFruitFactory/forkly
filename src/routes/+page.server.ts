import { db } from '$lib/server/db'
import { recipe, user, recipeLike } from '$lib/server/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const recipes = await db
		.select({
			id: recipe.id,
			title: recipe.title,
			description: recipe.description,
			ingredients: recipe.ingredients,
			instructions: recipe.instructions,
			imageUrl: recipe.imageUrl,
			likes: sql<number>`count(${recipeLike.userId})::int`,
			user: {
				username: user.username,
				avatarUrl: user.avatarUrl
			}
		})
		.from(recipe)
		.leftJoin(user, eq(recipe.userId, user.id))
		.leftJoin(recipeLike, eq(recipe.id, recipeLike.recipeId))
		.groupBy(recipe.id, user.username, user.avatarUrl)
		.orderBy(desc(recipe.createdAt))

	return { recipes }
}