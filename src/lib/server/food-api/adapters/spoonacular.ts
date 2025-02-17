import { SPOONACULAR_API_KEY } from '$env/static/private'
import { Ok, Err } from 'ts-results-es'
import type { FoodAPI } from '..'
// @ts-ignore
import Spoonacular from 'spoonacular'

const defaultClient = Spoonacular.ApiClient.instance

const apiKeyScheme = defaultClient.authentications['apiKeyScheme']
apiKeyScheme.apiKey = SPOONACULAR_API_KEY

const ingredientsApi = new Spoonacular.IngredientsApi()

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
						calories: data.nutrition.nutrients.find((n: any) => n.name === 'Calories')?.amount ?? 0,
						protein: data.nutrition.nutrients.find((n: any) => n.name === 'Protein')?.amount ?? 0,
						carbs: data.nutrition.nutrients.find((n: any) => n.name === 'Carbohydrates')?.amount ?? 0,
						fat: data.nutrition.nutrients.find((n: any) => n.name === 'Fat')?.amount ?? 0,
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
