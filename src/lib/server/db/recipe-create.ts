import { db } from '.'
import { recipe, ingredient, recipeIngredient, recipeNutrition } from './schema'
import { eq, isNull } from 'drizzle-orm'
import { generateId } from '$lib/server/id'
import type { MeasurementUnit } from '$lib/types'
import type { IngredientRecord } from './schema'

type IngredientInput = {
  name: string
  quantity: number
  measurement: MeasurementUnit
  custom: boolean
  spoonacularId?: number
  openfoodfactsId?: number
  usdaId?: number
}

type NutritionInput = {
  totalNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  hasCustomIngredients: boolean
}

type InstructionInput = {
  text: string
  mediaUrl?: string
  mediaType?: 'image' | 'video'
}

type RecipeInput = {
  title: string
  description?: string
  ingredients: IngredientInput[]
  instructions: InstructionInput[]
  nutrition: NutritionInput
  tags: string[]
  imageUrl?: string
}

export async function createRecipe(input: RecipeInput, userId?: string) {
  const recipeId = generateId()

  const newRecipe = await db.insert(recipe).values({
    id: recipeId,
    userId,
    title: input.title,
    description: input.description,
    instructions: input.instructions,
    tags: input.tags || [],
    imageUrl: input.imageUrl
  }).returning()

  await db.insert(recipeNutrition).values({
    recipeId: recipeId,
    calories: input.nutrition.totalNutrition.calories,
    protein: input.nutrition.totalNutrition.protein,
    carbs: input.nutrition.totalNutrition.carbs,
    fat: input.nutrition.totalNutrition.fat
  })

  for (const ingredientData of input.ingredients) {
    let ingredientId: string

    if (ingredientData.custom) {
      const existingIngredient = await db
        .select()
        .from(ingredient)
        .where(eq(ingredient.name, ingredientData.name))
        .limit(1)

      if (existingIngredient.length) {
        ingredientId = existingIngredient[0].id
      } else {
        const newIngredient = await db.insert(ingredient).values({
          id: generateId(),
          name: ingredientData.name,
          spoonacularId: null,
          custom: true
        }).returning()
        ingredientId = newIngredient[0].id
      }
    } else {
      const spoonacularId = ingredientData.spoonacularId || null

      let existingIngredient: IngredientRecord[] = []

      if (spoonacularId !== null) {
        existingIngredient = await db
          .select()
          .from(ingredient)
          .where(eq(ingredient.spoonacularId, spoonacularId))
          .limit(1)
      }

      if (!existingIngredient.length) {
        existingIngredient = await db
          .select()
          .from(ingredient)
          .where(eq(ingredient.name, ingredientData.name))
          .limit(1)
      }

      if (existingIngredient.length) {
        ingredientId = existingIngredient[0].id
      } else {
        const newIngredient = await db.insert(ingredient).values({
          id: generateId(),
          name: ingredientData.name,
          spoonacularId,
          custom: false
        }).returning()
        ingredientId = newIngredient[0].id
      }
    }

    await db.insert(recipeIngredient).values({
      recipeId: recipeId,
      ingredientId: ingredientId,
      quantity: ingredientData.quantity,
      measurement: ingredientData.measurement
    })
  }

  return newRecipe[0]
} 