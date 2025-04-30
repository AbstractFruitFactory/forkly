import { SPOONACULAR_API_KEY } from '$env/static/private'
// @ts-ignore
import Spoonacular from 'spoonacular'
import type { FoodAPI, RecipeNutritionInfo } from '..'

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

const extractNutrients = (nutrients: any[]) => {
	return {
		calories: nutrients.find((n: any) => n.name === 'Calories')?.amount ?? 0,
		protein: nutrients.find((n: any) => n.name === 'Protein')?.amount ?? 0,
		carbs: nutrients.find((n: any) => n.name === 'Carbohydrates')?.amount ?? 0,
		fat: nutrients.find((n: any) => n.name === 'Fat')?.amount ?? 0
	}
}

export const getIngredientInfo: FoodAPI['getIngredientInfo'] = async (id) => {
	const response = await ingredientsApi.getIngredientInformation(id, {
		amount: 1,
		unit: 'serving'
	})
	return response
}

export const findIngredients: FoodAPI['findIngredients'] = async (query) => {
	const response = await new Promise<(SpoonacularIngredientSearchResult & { custom: false })[]>((resolve, reject) => {
		ingredientsApi.autocompleteIngredientSearch(query, {
			number: 5,
			metaInformation: true
		}, (error: any, data: any) => {
			if (error) throw error
			resolve(data.map((item: any) => ({
				id: item.id,
				name: item.name,
				custom: false
			})))
		})
	})
	return response
}

export const getNutritionInfo: FoodAPI['getNutritionInfo'] = async (ingredientId, amount, unit) => {
	const response = await new Promise<SpoonacularNutritionResult>((resolve, reject) => {
		ingredientsApi.getIngredientInformation(ingredientId, {
			amount,
			unit
		}, (error: any, data: any) => {
			if (error) throw error
			console.log(data)
			resolve({
				...extractNutrients(data.nutrition.nutrients),
				servingSize: data.nutrition.weightPerServing?.amount ?? 100
			})
		})
	})
	return response
}

export const mapIngredientToDatabaseEntry: FoodAPI['mapIngredientToDatabaseEntry'] = (ingredient) => ({
	...ingredient,
	custom: false,
	spoonacularId: ingredient.id as number
})

export const getRecipeInfo: FoodAPI['getRecipeInfo'] = async (ingredients, instructions, servings = 1) => {
	const formattedIngredients = ingredients.map(ing =>
		`${ing.amount} ${ing.unit} ${ing.name}`
	)

	const payload = {
		title: 'Recipe',
		servings,
		ingredients: formattedIngredients,
		instructions
	}

	console.log('Analyze Recipe payload:', payload)

	const url = `https://api.spoonacular.com/recipes/analyze?apiKey=${SPOONACULAR_API_KEY}&language=en&includeNutrition=true`

	const res = await fetch(url,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		}
	)

	const data = await res.json()
	console.log('Analyze Recipe response:', data)

	const totals = {
		calories: data.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount ?? 0,
		protein: data.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount ?? 0,
		carbs: data.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount ?? 0,
		fat: data.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount ?? 0
	}

	return {
		...totals,
		ingredients: (data.ingredients || []).map((ingredient: any) => ({
			name: ingredient.name,
			amount: ingredient.amount?.metric?.value ?? ingredient.amount?.us?.value ?? 0,
			unit: ingredient.amount?.metric?.unit ?? ingredient.amount?.us?.unit ?? '',
			nutrients: {
				calories: ingredient.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount ?? 0,
				protein: ingredient.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount ?? 0,
				carbs: ingredient.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount ?? 0,
				fat: ingredient.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount ?? 0
			}
		}))
	}
}
