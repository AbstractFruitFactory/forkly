import { db } from '.'
import { recipe, ingredient, recipeIngredient, recipeNutrition, tag, recipeTag } from './schema'
import { eq } from 'drizzle-orm'
import { generateId } from '$lib/server/id'

type IngredientInput = {
  name: string
  displayName: string
  quantity?: number
  measurement?: string
}

type NutritionInput = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

type InstructionInput = {
  text: string
  mediaUrl?: string
  mediaType?: 'image' | 'video'
  ingredients?: IngredientInput[]
}

type RecipeInput = {
  title: string
  description?: string
  servings: number
  instructions: InstructionInput[]
  nutrition?: NutritionInput | null
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
    servings: input.servings,
    instructions: input.instructions,
    tags: input.tags || [],
    imageUrl: input.imageUrl
  }).returning()

  // Insert tags into tag and recipeTag tables
  for (const tagName of input.tags || []) {
    const existingTag = await db
      .select({ name: tag.name })
      .from(tag)
      .where(eq(tag.name, tagName))
      .limit(1)

    if (!existingTag.length) {
      await db
        .insert(tag)
        .values({ name: tagName })
    }

    await db.insert(recipeTag).values({ recipeId, tagName })
  }

  if (input.nutrition) {
    await db.insert(recipeNutrition).values({
      recipeId: recipeId,
      calories: input.nutrition.calories,
      protein: input.nutrition.protein,
      carbs: input.nutrition.carbs,
      fat: input.nutrition.fat
    })
  }

  // Aggregate ingredients from all instructions
  const aggregatedMap = new Map<string, IngredientInput>()
  for (const instr of input.instructions) {
    for (const ing of instr.ingredients || []) {
      const key = `${ing.name.toLowerCase()}|${ing.measurement ?? ''}`
      if (aggregatedMap.has(key)) {
        const existing = aggregatedMap.get(key)!
        if (ing.quantity !== undefined) {
          existing.quantity = (existing.quantity ?? 0) + (ing.quantity ?? 0)
        }
      } else {
        aggregatedMap.set(key, { ...ing })
      }
    }
  }

  for (const ingredientData of Array.from(aggregatedMap.values())) {
    let ingredientId: string

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
        name: ingredientData.name
      }).returning()
      ingredientId = newIngredient[0].id
    }

    await db.insert(recipeIngredient).values({
      recipeId: recipeId,
      ingredientId: ingredientId,
      displayName: ingredientData.displayName,
      quantity: ingredientData.quantity,
      measurement: ingredientData.measurement
    })
  }

  return newRecipe[0]
} 
