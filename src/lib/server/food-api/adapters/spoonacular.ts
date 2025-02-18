import { SPOONACULAR_API_KEY } from '$env/static/private'
import { Ok, Err } from 'ts-results-es'
import type { FoodAPI, RecipeNutritionInfo } from '..'
// @ts-ignore
import Spoonacular from 'spoonacular'

const defaultClient = Spoonacular.ApiClient.instance

const apiKeyScheme = defaultClient.authentications['apiKeyScheme']
apiKeyScheme.apiKey = SPOONACULAR_API_KEY

const ingredientsApi = new Spoonacular.IngredientsApi()
const recipesApi = new Spoonacular.RecipesApi()

interface SpoonacularIngredientSearchResult {
	id: number
	name: string
}

interface SpoonacularNutritionResult {
	calories: number
	protein: number
	carbs: number
	fat: number
	servingSize: number
}

function extractNutrients(nutrients: any[]) {
	return {
		calories: nutrients.find((n: any) => n.name === 'Calories')?.amount ?? 0,
		protein: nutrients.find((n: any) => n.name === 'Protein')?.amount ?? 0,
		carbs: nutrients.find((n: any) => n.name === 'Carbohydrates')?.amount ?? 0,
		fat: nutrients.find((n: any) => n.name === 'Fat')?.amount ?? 0
	}
}

export const getIngredientInfo: FoodAPI['getIngredientInfo'] = async (id) => {
	try {
		const response = await ingredientsApi.getIngredientInformation(id, {
			amount: 1,
			unit: 'serving'
		})
		return Ok(response)
	} catch (error) {
		return Err(error as Error)
	}
}

export const findIngredients: FoodAPI['findIngredients'] = async (query) => {
	try {
		const response = await new Promise<SpoonacularIngredientSearchResult[]>((resolve, reject) => {
			ingredientsApi.autocompleteIngredientSearch(query, {
				number: 5,
				metaInformation: true
			}, (error: any, data: any) => {
				if (error) reject(error)
				else resolve(data.map((item: any) => ({
					id: item.id,
					name: item.name
				})))
			})
		})
		return Ok(response)
	} catch (error) {
		return Err(error as Error)
	}
}

export const getNutritionInfo: FoodAPI['getNutritionInfo'] = async (ingredientId, amount, unit) => {
	try {
		const response = await new Promise<SpoonacularNutritionResult>((resolve, reject) => {
			ingredientsApi.getIngredientInformation(ingredientId, {
				amount,
				unit
			}, (error: any, data: any) => {
				if (error) reject(error)
				else {
					resolve({
						...extractNutrients(data.nutrition.nutrients),
						servingSize: data.nutrition.weightPerServing?.amount ?? 100
					})
				}
			})
		})
		return Ok(response)
	} catch (error) {
		return Err(error as Error)
	}
}

export const mapIngredientToDatabaseEntry: FoodAPI['mapIngredientToDatabaseEntry'] = (ingredient) => ({
	...ingredient,
	spoonacularId: ingredient.id as number
})

export const getRecipeInfo: FoodAPI['getRecipeInfo'] = async (ingredients) => {
	try {
		const formattedIngredients = ingredients.map(ing =>
			`${ing.amount} ${ing.unit} ${ing.name}`
		)

		const response = await new Promise<RecipeNutritionInfo>((resolve, reject) => {
			recipesApi.parseIngredients(
				formattedIngredients.join('\n'),
				1,
				{
					includeNutrition: true,
					language: 'en'
				},
				(error: any, data: any) => {
					if (error) reject(error)
					else {
						// Calculate total nutrition values
						const totals = data.reduce((acc: any, ingredient: any) => {
							const nutrients = extractNutrients(ingredient.nutrition.nutrients)
							return {
								calories: acc.calories + nutrients.calories,
								protein: acc.protein + nutrients.protein,
								carbs: acc.carbs + nutrients.carbs,
								fat: acc.fat + nutrients.fat,
							}
						}, { calories: 0, protein: 0, carbs: 0, fat: 0 })

						resolve({
							...totals,
							ingredients: data.map((ingredient: any) => ({
								name: ingredient.originalName,
								amount: ingredient.amount,
								unit: ingredient.unit,
								nutrients: extractNutrients(ingredient.nutrition.nutrients)
							}))
						})
					}
				}
			)
		})

		return Ok(response)
	} catch (error) {
		return Err(error as Error)
	}
}
