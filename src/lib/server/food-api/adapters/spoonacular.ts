import { SPOONACULAR_API_KEY } from '$env/static/private'
import { Ok, Err, Result } from 'ts-results'
// @ts-ignore
import Spoonacular from 'spoonacular'

const defaultClient = Spoonacular.ApiClient.instance

const apiKeyScheme = defaultClient.authentications['apiKeyScheme']
apiKeyScheme.apiKey = SPOONACULAR_API_KEY

const api = new Spoonacular.DefaultApi()
const ingredientsApi = new Spoonacular.IngredientsApi()

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
