import { db } from '$lib/server/db'
import { recipe, user, recipeLike, recipeBookmark, recipeIngredient, ingredient, recipeNutrition } from '$lib/server/db/schema'
import { desc, eq, sql, ilike, or, and, inArray } from 'drizzle-orm'
import type { PageServerLoad } from './$types'
import type { DietType } from '$lib/types'

export const load: PageServerLoad = async ({ url }) => {
	const searchQuery = url.searchParams.get('search') || ''

	const dietsParam = url.searchParams.get('diets') || ''
	const diets = dietsParam ? dietsParam.split(',') as DietType[] : []

	const ingredientsParam = url.searchParams.get('ingredients') || ''
	const ingredients = ingredientsParam ? ingredientsParam.split(',') : []

	let whereCondition = undefined
	const conditions = []

	if (searchQuery) {
		const searchTerms = searchQuery.trim().split(/\s+/).map((term) => `%${term}%`)
		const searchConditions = searchTerms.map((term) => ilike(recipe.title, term))
		conditions.push(or(...searchConditions))
	}

	if (diets.length > 0) {
		conditions.push(sql`${recipe.diets} ?| array[${diets.join(',')}]`)
	}

	if (conditions.length > 0) {
		whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions)
	}

	let recipes = await db
		.select({
			id: recipe.id,
			title: recipe.title,
			description: recipe.description,
			instructions: recipe.instructions,
			imageUrl: recipe.imageUrl,
			diets: recipe.diets,
			createdAt: recipe.createdAt,
			likes: sql<number>`count(DISTINCT ${recipeLike.userId})::int`,
			bookmarks: sql<number>`count(DISTINCT ${recipeBookmark.userId})::int`,
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
		.leftJoin(recipeBookmark, eq(recipe.id, recipeBookmark.recipeId))
		.leftJoin(recipeNutrition, eq(recipe.id, recipeNutrition.recipeId))
		.leftJoin(recipeIngredient, eq(recipe.id, recipeIngredient.recipeId))
		.leftJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
		.where(whereCondition)
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

	if (ingredients.length > 0) {
		whereCondition = and(
			whereCondition,
			sql`EXISTS (
					SELECT 1 FROM recipe_ingredient ri
					JOIN ingredient i ON ri.ingredient_id = i.id
					WHERE ri.recipe_id = ${recipe.id}
					AND i.name ILIKE ANY (ARRAY[${ingredients.map(i => `%${i}%`)}])
					GROUP BY ri.recipe_id
				HAVING COUNT(*) = ${ingredients.length}
			)`
		)
	}

	return {
		recipes,
		searchQuery,
		filters: {
			diets,
			ingredients
		}
	}
}