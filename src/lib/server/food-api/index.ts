import { type Result, Ok, Err } from 'ts-results-es'
import * as spoonacular from './adapters/spoonacular'
import * as openai from './adapters/openai'
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
  mapIngredientToDatabaseEntry(ingredient: Ingredient): any
  findIngredients(query: string): Promise<IngredientSearchResult>
  getIngredientInfo(id: number): Promise<any>
  getNutritionInfo(id: number, amount: number, unit: string): Promise<NutritionInfo>
  getRecipeInfo(ingredients: { amount?: number, unit?: string, name: string }[], instructions: string, servings?: number): Promise<RecipeNutritionInfo>
}

const _api: FoodAPI = {
  ...spoonacular,
  getRecipeInfo: openai.getRecipeInfo
}

export const api = <T extends keyof FoodAPI>(
  methodName: T
) => async (...args: Parameters<FoodAPI[T]>): Promise<Result<Awaited<ReturnType<FoodAPI[T]>>, Error>> => {
  try {
    const result = await (_api[methodName] as any)(...args)
    return Ok(result)
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)))
  }
}

