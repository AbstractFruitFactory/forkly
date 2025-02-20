import { Ok, Err } from 'ts-results-es'
import type { FoodAPI } from '..'
import foodData from '../data/usda.json'

type FoodData = {
  FoundationFoods: USDAFood[]
}

type USDANutrient = {
  nutrient: {
    id: number
    name: string
    number: string
    rank: number
    unitName: string
  }
  type: string
  id: number
  amount: number
}

type USDAFood = {
  fdcId: number
  description: string
  dataType: string
  foodClass: string
  foodCategory: {
    id: number
    code: string
    description: string
  }
  publicationDate: string
  scientificName: string
  brandOwner: string
  gtinUpc: string
  ingredients: string
  ndbNumber: string
  foodNutrients: USDANutrient[]
}

const foods = ((foodData as FoodData).FoundationFoods as USDAFood[]).map((food, index) => ({
  id: food.fdcId,
  name: food.description,
  nutrients: food.foodNutrients.reduce((acc, nutrient) => {
    acc[nutrient.nutrient.name] = nutrient.amount
    return acc
  }, {} as Record<string, number>)
}))

const findNutrientValue = (nutrients: Record<string, number>, names: string[]): number => {
  for (const name of names) {
    if (name in nutrients) {
      return nutrients[name]
    }
  }
  return 0
}

const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  oz: 28.3495,
  lb: 453.592,
  kg: 1000,
  cup: 128, // approximate, varies by ingredient
  tbsp: 15, // approximate
  tsp: 5,   // approximate
}

export const findIngredients: FoodAPI['findIngredients'] = async (query) => {
  const normalizedQuery = query.toLowerCase()
  const matches = foods
    .filter(food => food.name.toLowerCase().includes(normalizedQuery))
    .slice(0, 5)
    .map(({ id, name }) => ({ id, name }))
  return Ok(matches)
}

export const getIngredientInfo: FoodAPI['getIngredientInfo'] = async (id) => {
  const food = foods.find(f => f.id === id)
  if (!food) {
    return Err(new Error(`Ingredient with id ${id} not found`))
  }
  return Ok(food)
}

export const getNutritionInfo: FoodAPI['getNutritionInfo'] = async (ingredientId, amount, unit) => {
  const food = foods.find(f => f.id === ingredientId)
  if (!food) {
    return Err(new Error(`Ingredient with id ${ingredientId} not found`))
  }

  // Convert amount to grams for calculation
  const conversionFactor = UNIT_TO_GRAMS[unit.toLowerCase()] ?? 1
  const gramsAmount = amount * conversionFactor

  const scale = gramsAmount / 100 // USDA data is per 100g

  return Ok({
    calories: findNutrientValue(food.nutrients, [
      'Energy',
      'Energy (Atwater General Factors)',
      'Energy (Atwater Specific Factors)'
    ]) * scale,
    protein: findNutrientValue(food.nutrients, [
      'Protein',
      'Total protein',
      'Protein, total'
    ]) * scale,
    carbs: findNutrientValue(food.nutrients, [
      'Carbohydrate, by difference',
      'Carbohydrates, total',
      'Total Carbohydrate'
    ]) * scale,
    fat: findNutrientValue(food.nutrients, [
      'Total lipid (fat)',
      'Total fat',
      'Fat, total'
    ]) * scale,
    servingSize: amount
  })
}

export const mapIngredientToDatabaseEntry: FoodAPI['mapIngredientToDatabaseEntry'] = (ingredient) => ({
  ...ingredient,
  usdaId: ingredient.id as number,
  custom: false
}) 