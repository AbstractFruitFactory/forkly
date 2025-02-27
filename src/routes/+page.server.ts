import { db } from '$lib/server/db'
import { recipe, user, recipeLike, recipeIngredient, ingredient, recipeNutrition } from '$lib/server/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const recipes = await db
		.select({
			id: recipe.id,
			title: recipe.title,
			description: recipe.description,
			instructions: recipe.instructions,
			imageUrl: recipe.imageUrl,
			diets: recipe.diets,
			likes: sql<number>`count(${recipeLike.userId})::int`,
			calories: recipeNutrition.calories,
			protein: recipeNutrition.protein,
			carbs: recipeNutrition.carbs,
			fat: recipeNutrition.fat,
			user: {
				username: user.username,
				avatarUrl: user.avatarUrl
			},
			ingredients: sql<Array<{
				id: string
				name: string
				quantity: number
				measurement: string
			}>>`json_agg(
				json_build_object(
					'id', ${ingredient.id},
					'name', ${ingredient.name},
					'quantity', ${recipeIngredient.quantity},
					'measurement', ${recipeIngredient.measurement}
				)
			) filter (where ${ingredient.id} is not null)`
		})
		.from(recipe)
		.leftJoin(user, eq(recipe.userId, user.id))
		.leftJoin(recipeLike, eq(recipe.id, recipeLike.recipeId))
		.leftJoin(recipeNutrition, eq(recipe.id, recipeNutrition.recipeId))
		.leftJoin(recipeIngredient, eq(recipe.id, recipeIngredient.recipeId))
		.leftJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
		.groupBy(
			recipe.id,
			user.username,
			user.avatarUrl,
			recipeNutrition.calories,
			recipeNutrition.protein,
			recipeNutrition.carbs,
			recipeNutrition.fat
		)
		.orderBy(desc(recipe.createdAt))

	return { recipes }
}