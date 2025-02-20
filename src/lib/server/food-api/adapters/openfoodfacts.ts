import { join } from 'node:path'
import { promises as fs } from 'node:fs'
import type { FoodAPI } from '../index'

const DATA_PATH = join(process.cwd(), 'src/lib/server/food-api/data/filtered_ingredients.jsonl')

interface FilteredIngredient extends Record<string, string> {
  code: string
  product_name: string
  categories_tags: string
}

let ingredientsCache: FilteredIngredient[] | null = null

// Load ingredients when module is imported
void (async () => {
  try {
    const fileContent = await fs.readFile(DATA_PATH, 'utf-8')
    ingredientsCache = fileContent
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line))
    console.log(`Loaded ${ingredientsCache.length} ingredients`)
  } catch (error) {
    console.error('Failed to load ingredients:', error)
    ingredientsCache = []
  }
})()

const loadIngredients = async (): Promise<FilteredIngredient[]> => {
  if (ingredientsCache) return ingredientsCache

  // Fallback in case initial load failed
  try {
    const fileContent = await fs.readFile(DATA_PATH, 'utf-8')
    const ingredients = fileContent
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line)) as FilteredIngredient[]

    ingredientsCache = ingredients
    return ingredients
  } catch (error) {
    console.error('Failed to load ingredients:', error)
    return []
  }
}

export const getIngredientInfo: FoodAPI['getIngredientInfo'] = async (id) => {
  try {
    const ingredients = await loadIngredients()
    const ingredient = ingredients.find(i => i.code === id.toString())

    if (!ingredient) {
      throw new Error(`Ingredient with ID ${id} not found`)
    }

    return {
      code: ingredient.code,
      product_name: ingredient.product_name,
      categories_tags: ingredient.categories_tags.split(',')
    }
  } catch (error) {
    throw error as Error
  }
}

export const findIngredients: FoodAPI['findIngredients'] = async (query) => {
  const ingredients = await loadIngredients()
  const searchTerms = query.toLowerCase().split(' ')

  return ingredients
    .filter(ingredient =>
      searchTerms.some(term =>
        ingredient.product_name.toLowerCase().includes(term)
      )
    )
    .map(ingredient => ({
      name: ingredient.product_name,
      id: parseInt(ingredient.code),
      custom: false as const
    }))
    .slice(0, 25)
}

export const getNutritionInfo: FoodAPI['getNutritionInfo'] = async (
  id,
  amount,
  unit
) => {
  try {
    const product = await getIngredientInfo(id)
    const scale = amount / 100 // OpenFoodFacts data is per 100g

    return {
      calories: (product.nutriments?.['energy-kcal_100g'] ?? 0) * scale,
      protein: (product.nutriments?.proteins_100g ?? 0) * scale,
      carbs: (product.nutriments?.carbohydrates_100g ?? 0) * scale,
      fat: (product.nutriments?.fat_100g ?? 0) * scale,
      servingSize: amount
    }
  } catch (error) {
    throw error as Error
  }
}

export const mapIngredientToDatabaseEntry: FoodAPI['mapIngredientToDatabaseEntry'] = (ingredient) => ({
  ...ingredient,
  openfoodfactsId: ingredient.id as number,
  custom: false
})

export const getRecipeInfo: FoodAPI['getRecipeInfo'] = async (ingredients) => {
  try {
    const allIngredients = await loadIngredients()
    let totalNutrients = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }

    const ingredientsWithNutrition = await Promise.all(
      ingredients.map(async (ing) => {
        const ingredient = allIngredients.find(i =>
          i.product_name.toLowerCase().includes(ing.name.toLowerCase())
        )

        // For now, return zero nutrients since we don't have nutrition data in filtered ingredients
        const nutrients = { calories: 0, protein: 0, carbs: 0, fat: 0 }
        return { ...ing, nutrients }
      })
    )

    return {
      ...totalNutrients,
      ingredients: ingredientsWithNutrition
    }
  } catch (error) {
    throw error as Error
  }
}