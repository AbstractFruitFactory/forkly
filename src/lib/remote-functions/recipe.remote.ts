import { getRequestEvent } from "$app/server"
import { command } from "$app/server"
import { parseQuantityToNumber } from "$lib/utils/ingredient-formatting"
import { error } from "@sveltejs/kit"
import { createRecipe as createRecipeDb, updateRecipe as updateRecipeDb } from "$lib/server/db/recipe-create"
import { deleteImage, deleteVideo, moveToFolder } from "$lib/server/cloudinary"
import { sanitizeIngredientQueue } from "$lib/server/queue"
import { type ClientRecipeInput } from "$lib/server/utils/recipe-form"
import { RecipeSchema } from "./schemas"
import * as v from 'valibot'

const cleanupUploadedMediaFromObject = async (
  input: { imageUrl?: string; instructions: Array<{ mediaUrl?: string; mediaType?: 'image' | 'video' }> }
) => {
  try {
    if (input.imageUrl) {
      try { await deleteImage(input.imageUrl) } catch { }
    }
    for (const ins of input.instructions) {
      if (ins.mediaUrl) {
        if (ins.mediaType === 'video') { try { await deleteVideo(ins.mediaUrl) } catch { } }
        else { try { await deleteImage(ins.mediaUrl) } catch { } }
      }
    }
  } catch (e) {
    console.error('Failed to cleanup media from object input', e)
  }
}

const moveMediaFromTmpFolder = async <T extends { imageUrl?: string; instructions: Array<{ mediaUrl?: string; mediaType?: 'image' | 'video' }> }>(input: T) => {
  let imageUrl = input.imageUrl
  let instructions = input.instructions

  if (imageUrl && imageUrl.includes('-tmp')) {
    imageUrl = await moveToFolder(imageUrl, 'recipe-images', 'image')
  }
  for (const ins of instructions) {
    if (ins.mediaUrl && ins.mediaUrl.includes('-tmp')) {
      ins.mediaUrl = await moveToFolder(ins.mediaUrl, 'instruction-media', ins.mediaType === 'video' ? 'video' : 'image')
    }
  }
  return { ...input, imageUrl, instructions } as T
}

const ensureRecipeHasIngredients = (input: { instructions: Array<{ ingredients?: unknown[] }> }) => {
  const allIngredients = input.instructions.flatMap(instruction => instruction.ingredients || [])
  if (allIngredients.length === 0) error(400, 'Recipe must have at least one ingredient')
}

const transformIngredientQuantity = (
  ingredients: NonNullable<v.InferOutput<typeof RecipeSchema>['instructions'][number]['ingredients']>
) => ingredients.map((ingredient) => ({
  ...ingredient,
  displayName: ingredient.name,
  quantity: ingredient.isPrepared ? undefined : (typeof ingredient.quantity === 'string' && ingredient.quantity.trim() !== ''
    ? { text: ingredient.quantity, numeric: parseQuantityToNumber(ingredient.quantity) }
    : undefined)
}))

export const createRecipe = command(RecipeSchema, async (input) => {
  const { locals } = getRequestEvent()
  if (!locals.user) error(401, 'Unauthorized')
  const inputWithMovedMedia = await moveMediaFromTmpFolder(input)

  ensureRecipeHasIngredients(inputWithMovedMedia)

  const transformedInput = {
    ...inputWithMovedMedia,
    instructions: inputWithMovedMedia.instructions.map((instruction) => ({
      ...instruction,
      ingredients: instruction.ingredients ? transformIngredientQuantity(instruction.ingredients) : undefined
    }))
  }

  let newRecipe: Awaited<ReturnType<typeof createRecipeDb>>
  
  try {
    newRecipe = await createRecipeDb(transformedInput, locals.user.id)
  } catch (e) {
    console.error('Error creating recipe', e)
    await cleanupUploadedMediaFromObject(inputWithMovedMedia)
    error(500, 'An unexpected error occurred while creating the recipe')
  }

  await sanitizeIngredientQueue.add('sanitize', {
    recipeId: newRecipe.id
  })

  return { recipeId: newRecipe.id }
})

const UpdateRecipeSchema = v.intersect([
  RecipeSchema,
  v.object({
    id: v.string()
  })
])

export const updateRecipe = command(UpdateRecipeSchema, async (input) => {
  const { locals } = getRequestEvent()
  if (!locals.user) error(401, 'Unauthorized')
  const inputWithMovedMedia = await moveMediaFromTmpFolder(input)

  ensureRecipeHasIngredients(inputWithMovedMedia)

  const transformedInput = {
    ...inputWithMovedMedia,
    instructions: inputWithMovedMedia.instructions.map((instruction) => ({
      ...instruction,
      ingredients: instruction.ingredients ? transformIngredientQuantity(instruction.ingredients) : undefined
    }))
  }

  let updatedRecipe: Awaited<ReturnType<typeof updateRecipeDb>>

  try {
    updatedRecipe = await updateRecipeDb(transformedInput, locals.user.id)
  } catch (e) {
    console.error('Error updating recipe', e)
    await cleanupUploadedMediaFromObject(inputWithMovedMedia)
    error(500, 'An unexpected error occurred while updating the recipe')
  }

  await sanitizeIngredientQueue.add('sanitize', {
    recipeId: updatedRecipe.id
  })
})
