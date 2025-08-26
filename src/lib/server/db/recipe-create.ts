import { db } from '.'
import { recipe, recipeInstruction, recipeIngredient, recipeNutrition, tag, recipeTag } from './schema'
import { eq, and } from 'drizzle-orm'
import { generateId } from '$lib/server/id'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

type IngredientInput = {
  name: string
  displayName: string
  quantity?: { text: string, numeric?: number }
  measurement?: string
  isPrepared?: boolean
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
  hint?: string
  hints?: string[]
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

async function setTagsInTransaction(tx: PostgresJsDatabase, recipeId: string, tagsInput: string[]) {
  for (const tagName of tagsInput || []) {
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
}

async function replaceNutritionInTransaction(tx: PostgresJsDatabase, recipeId: string, nutrition?: NutritionInput | null) {
  await tx.delete(recipeNutrition).where(eq(recipeNutrition.recipeId, recipeId))
  if (nutrition) {
    await tx.insert(recipeNutrition).values({
      recipeId: recipeId,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    })
  }
}

async function insertInstructionsAndIngredients(tx: PostgresJsDatabase, recipeId: string, instructions: InstructionInput[]) {
  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i]

    await tx.insert(recipeInstruction).values({
      id: instruction.id,
      recipeId: recipeId,
      text: instruction.text,
      mediaUrl: instruction.mediaUrl,
      mediaType: instruction.mediaType,
      order: i + 1
    })

    // Single hint is stored in recipe_instruction.hint
    if (instruction.hint && instruction.hint.trim() !== '') {
      await tx.update(recipeInstruction).set({ hint: instruction.hint }).where(eq(recipeInstruction.id, instruction.id))
    }

    if (instruction.ingredients) {
      for (const ingredientData of instruction.ingredients) {
        await tx.insert(recipeIngredient).values({
          recipeId: recipeId,
          instructionId: instruction.id,
          displayName: ingredientData.displayName,
          quantity: ingredientData.quantity?.text,
          numericQuantity: ingredientData.quantity?.numeric,
          measurement: ingredientData.measurement,
          isPrepared: ingredientData.isPrepared ?? false
        })
      }
    }
  }
}

export async function createRecipe(input: RecipeInput, userId: string) {
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

    await setTagsInTransaction(tx, recipeId, input.tags || [])

    await replaceNutritionInTransaction(tx, recipeId, input.nutrition)

    await insertInstructionsAndIngredients(tx, recipeId, input.instructions)

    return newRecipe[0]
  })
}

export async function updateRecipe(input: RecipeInput & { id: string }, userId: string) {
  return await db.transaction(async (tx) => {
    const whereExpr = and(eq(recipe.id, input.id), eq(recipe.userId, userId))

    const updated = await tx.update(recipe).set({
      title: input.title,
      description: input.description,
      servings: input.servings,
      imageUrl: input.imageUrl
    }).where(whereExpr).returning()

    if (!updated.length) {
      throw new Error('Recipe not found')
    }

    const recipeId = input.id

    await tx.delete(recipeIngredient).where(eq(recipeIngredient.recipeId, recipeId))
    await tx.delete(recipeInstruction).where(eq(recipeInstruction.recipeId, recipeId))

    await tx.delete(recipeTag).where(eq(recipeTag.recipeId, recipeId))
    await setTagsInTransaction(tx, recipeId, input.tags || [])

    await replaceNutritionInTransaction(tx, recipeId, input.nutrition)

    await insertInstructionsAndIngredients(tx, recipeId, input.instructions)

    return updated[0]
  })
} 
