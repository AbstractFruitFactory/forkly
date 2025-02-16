import { type Result } from 'ts-results-es'
import * as spoonacular from './adapters/spoonacular'

export type IngredientSearchResult = { name: string }[]

export interface FoodAPI {
  findIngredients(query: string): Promise<Result<IngredientSearchResult, Error>>
  getIngredientInfo(id: number): Promise<Result<any, Error>>
}

// Create an adapter that implements our interface using Spoonacular
export const api: FoodAPI = {
  findIngredients: spoonacular.findIngredient,
  getIngredientInfo: spoonacular.getIngredientInfo
}