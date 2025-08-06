import { db } from '.'
import { recipe, recipeInstruction, recipeIngredient, recipeNutrition, tag, recipeTag } from './schema'
import { eq } from 'drizzle-orm'
import { generateId } from '$lib/server/id'
import { addIngredient } from './ingredient'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

type IngredientInput = {
  name: string
  displayName: string
  quantity?: { text: string, numeric?: number }
  measurement?: string
}

type NutritionInput = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

type InstructionInput = {
  id: string
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

async function addIngredientInTransaction(tx: PostgresJsDatabase, name: string) {
  const { ingredient } = await import('./schema')
  const { ilike } = await import('drizzle-orm')
  const { normalizeIngredientName } = await import('$lib/server/utils/normalize-ingredient')
  const stringSimilarity = await import('string-similarity')
  
  const normalizedInput = normalizeIngredientName(name)
  if (!normalizedInput) {
    throw new Error('Ingredient name cannot be empty')
  }
  
  const existingIngredients = await tx
    .select({ id: ingredient.id, name: ingredient.name })
    .from(ingredient)

  // Step 1: Exact match
  const exact = existingIngredients.find(i => i.name === normalizedInput)
  if (exact) {
    return exact
  }

  // Step 2: Fuzzy match
  if (existingIngredients.length > 0) {
    const { bestMatch } = stringSimilarity.default.findBestMatch(normalizedInput, existingIngredients.map(i => i.name))
    if (bestMatch.rating > 0.85) {
      const matched = existingIngredients.find(i => i.name === bestMatch.target)
      if (matched) {
        return matched
      }
    }
  }
  
  // Step 3: Create new ingredient
  const newIngredient = await tx.insert(ingredient).values({
    id: generateId(),
    name: normalizedInput
  }).returning()
  return newIngredient[0]
}

export async function createRecipe(input: RecipeInput, userId?: string) {
  return await db.transaction(async (tx) => {
    const recipeId = generateId()

    const newRecipe = await tx.insert(recipe).values({
      id: recipeId,
      userId,
      title: input.title,
      description: input.description,
      servings: input.servings,
      imageUrl: input.imageUrl
    }).returning()

    // Insert tags into tag and recipeTag tables
    for (const tagName of input.tags || []) {
      const normalizedTagName = tagName.toLowerCase()
      const existingTag = await tx
        .select({ name: tag.name })
        .from(tag)
        .where(eq(tag.name, normalizedTagName))
        .limit(1)

      if (!existingTag.length) {
        await tx
          .insert(tag)
          .values({ name: normalizedTagName })
      }

      await tx.insert(recipeTag).values({ recipeId, tagName: normalizedTagName })
    }

    if (input.nutrition) {
      await tx.insert(recipeNutrition).values({
        recipeId: recipeId,
        calories: input.nutrition.calories,
        protein: input.nutrition.protein,
        carbs: input.nutrition.carbs,
        fat: input.nutrition.fat
      })
    }

    // Insert instructions and their ingredients
    for (let i = 0; i < input.instructions.length; i++) {
      const instruction = input.instructions[i]

      // Insert the instruction
      const newInstruction = await tx.insert(recipeInstruction).values({
        id: instruction.id,
        recipeId: recipeId,
        text: instruction.text,
        mediaUrl: instruction.mediaUrl,
        mediaType: instruction.mediaType,
        order: i + 1
      }).returning()

      // Insert ingredients for this instruction
      if (instruction.ingredients) {
        for (const ingredientData of instruction.ingredients) {
          let ingredientId: string

          const ingredientObj = await addIngredientInTransaction(tx, ingredientData.name)
          ingredientId = ingredientObj.id

          await tx.insert(recipeIngredient).values({
            recipeId: recipeId,
            instructionId: instruction.id,
            ingredientId: ingredientId,
            displayName: ingredientData.displayName,
            quantity: ingredientData.quantity?.text,
            numericQuantity: ingredientData.quantity?.numeric,
            measurement: ingredientData.measurement
          })
        }
      }
    }

    return newRecipe[0]
  })
} 
