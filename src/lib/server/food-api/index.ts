import { type Result } from 'ts-results-es'
import * as spoonacular from './adapters/spoonacular'
import type { Recipe } from '$lib/server/db/schema'
import type { Ingredient } from '$lib/types'

export type IngredientSearchResult = {
  name: string
  id: number
  custom: false
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

export type FoodAPI = {
  mapIngredientToDatabaseEntry(ingredient: Ingredient): Recipe['ingredients'][number]
  findIngredients(query: string): Promise<Result<IngredientSearchResult, Error>>
  getIngredientInfo(id: number): Promise<Result<any, Error>>
  getNutritionInfo(id: number, amount: number, unit: string): Promise<Result<NutritionInfo, Error>>
  getRecipeInfo(ingredients: { amount: number, unit: string, name: string }[]): Promise<Result<RecipeNutritionInfo, Error>>
}

const _api: FoodAPI = {
  ...spoonacular
}

export const api = <T extends keyof FoodAPI>(
  methodName: T
) => (...args: Parameters<FoodAPI[T]>): Promise<ReturnType<FoodAPI[T]>> =>
  (_api[methodName] as any)(...args)

