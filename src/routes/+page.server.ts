import { db } from '$lib/server/db'
import { recipe, user, recipeLike, recipeIngredient, ingredient, recipeNutrition } from '$lib/server/db/schema'
import { desc, eq, sql, ilike, or, and, inArray } from 'drizzle-orm'
import type { PageServerLoad } from './$types'
import type { DietType } from '$lib/types'

export const load: PageServerLoad = async ({ url }) => {
	const searchQuery = url.searchParams.get('search') || ''
	
	// Parse diets from query params (comma-separated list)
	const dietsParam = url.searchParams.get('diets') || ''
	const diets = dietsParam ? dietsParam.split(',') as DietType[] : []
	
	// Parse ingredients from query params (comma-separated list)
	const ingredientsParam = url.searchParams.get('ingredients') || ''
	const ingredients = ingredientsParam ? ingredientsParam.split(',') : []

	// Build where condition
	let whereCondition = undefined
	const conditions = []

	// Add title search if provided
	if (searchQuery) {
		const searchTerms = searchQuery.trim().split(/\s+/).map((term) => `%${term}%`)
		const searchConditions = searchTerms.map((term) => ilike(recipe.title, term))
		conditions.push(or(...searchConditions))
	}
	
	// Add diet filter if provided
	if (diets.length > 0) {
		// This uses a JSON contains operator to check if the diets array contains any of the specified diets
		conditions.push(sql`${recipe.diets} ?| array[${diets.join(',')}]`)
	}

	// Combine conditions if any exist
	if (conditions.length > 0) {
		whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions)
	}

	// Execute the query
	let recipes = await db
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
	
	// Filter by ingredients if specified
	if (ingredients.length > 0) {
		// Post-process to filter by ingredients
		// This is a simplified approach - in a real app, you'd want to do this in the SQL query
		recipes = recipes.filter(r => {
			const recipeIngredients = r.ingredients || []
			return ingredients.every(searchIngredient => 
				recipeIngredients.some(ri => 
					ri.name.toLowerCase().includes(searchIngredient.toLowerCase())
				)
			)
		})
	}

	console.log(recipes)

	return {
		recipes,
		searchQuery,
		filters: {
			diets,
			ingredients
		}
	}
}