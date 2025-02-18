import { type Result } from 'ts-results-es'
import * as spoonacular from './adapters/spoonacular'
import type { Recipe } from '$lib/server/db/schema'
import type { Ingredient } from '$lib/types'

export type IngredientSearchResult = {
  name: string
  id: number
}[]

// Add new type for nutrition info
export type NutritionInfo = {
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: number
}

// Add new type for recipe nutrition info
export type RecipeNutritionInfo = {
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: {
    name: string
    amount: number
    unit: string
    nutrients: {
      calories: number
      protein: number
      carbs: number
      fat: number
    }
  }[]
}

export interface FoodAPI {
  mapIngredientToDatabaseEntry(ingredient: Ingredient): Recipe['ingredients'][number]
  findIngredients(query: string): Promise<Result<IngredientSearchResult, Error>>
  getIngredientInfo(id: number): Promise<Result<any, Error>>
  getNutritionInfo(id: number, amount: number, unit: string): Promise<Result<NutritionInfo, Error>>
  getRecipeInfo(ingredients: {amount: number, unit: string, name: string}[]): Promise<Result<RecipeNutritionInfo, Error>>
}

export const api: FoodAPI = {
  ...spoonacular
}