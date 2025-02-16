import { SPOONACULAR_API_KEY } from '$env/static/private'
import { Ok, Err, type Result } from 'ts-results-es'
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

export const getIngredientInfo = async (id: number): Promise<Result<Spoonacular.IngredientInformation, Error>> => {
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

export const findIngredient = async (query: string): Promise<Result<SpoonacularIngredientSearchResult[], Error>> => {
	try {
		const response = await new Promise<SpoonacularIngredientSearchResult[]>((resolve, reject) => {
			ingredientsApi.autocompleteIngredientSearch(query, {
				number: 5,
				metaInformation: true
			}, (error: any, data: any) => {
				if (error) reject(error)
				else resolve(data)
			})
		})
		return Ok(response)
	} catch (error) {
		return Err(error as Error)
	}
}
