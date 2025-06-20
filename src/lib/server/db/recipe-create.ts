import { db } from '.'
import { recipe, ingredient, recipeIngredient, recipeNutrition, tag, recipeTags } from './schema'
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
}

type RecipeInput = {
  title: string
  description?: string
  servings: number
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
    servings: input.servings,
    instructions: input.instructions,
    imageUrl: input.imageUrl
  }).returning()

  await db.insert(recipeNutrition).values({
    recipeId: recipeId,
    calories: input.nutrition.calories,
    protein: input.nutrition.protein,
    carbs: input.nutrition.carbs,
    fat: input.nutrition.fat
  })

  const tagsToInsert = (input.tags || []).slice(0, 3)
  for (const t of tagsToInsert) {
    await db.insert(tag).values({ name: t }).onConflictDoNothing()
  }
  await db.insert(recipeTags).values({ recipeId, tags: tagsToInsert })

  for (const ingredientData of input.ingredients) {
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

  return { ...newRecipe[0], tags: tagsToInsert }
}
