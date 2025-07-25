import { db } from '.'
import { recipe, recipeInstruction, recipeIngredient, recipeNutrition, tag, recipeTag } from './schema'
import { eq } from 'drizzle-orm'
import { generateId } from '$lib/server/id'
import { addIngredient } from './ingredient'

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

export async function createRecipe(input: RecipeInput, userId?: string) {
  const recipeId = generateId()

  const newRecipe = await db.insert(recipe).values({
    id: recipeId,
    userId,
    title: input.title,
    description: input.description,
    servings: input.servings,

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

  // Insert instructions and their ingredients
  for (let i = 0; i < input.instructions.length; i++) {
    const instruction = input.instructions[i]
    
    // Insert the instruction
    const newInstruction = await db.insert(recipeInstruction).values({
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

        const ingredientObj = await addIngredient(ingredientData.name)
        ingredientId = ingredientObj.id

        await db.insert(recipeIngredient).values({
          recipeId: recipeId,
          instructionId: instruction.id,
          ingredientId: ingredientId,
          displayName: ingredientData.displayName,
          quantity: ingredientData.quantity,
          measurement: ingredientData.measurement
        })
      }
    }
  }

    return newRecipe[0]
} 
