import { getRequestEvent } from "$app/server"
import { command } from "$app/server"
import { parseQuantityToNumber, UNIT_DISPLAY_SINGULAR } from "$lib/utils/ingredient-formatting"
import { measurementUnits } from "$lib/types"
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

const normalizeUnitToCanonical = (unitText: string | undefined): string | undefined => {
  if (!unitText) return undefined
  const raw = unitText.trim().toLowerCase().replace(/\.+/g, '').replace(/\s+/g, ' ')
  const displayToKey = new Map<string, string>(Object.entries(UNIT_DISPLAY_SINGULAR).map(([k, v]) => [v.toLowerCase(), k]))
  if (displayToKey.has(raw)) return displayToKey.get(raw)!

  const singularToPlural: Record<string, string> = {
    gram: 'grams', kilogram: 'kilograms', ounce: 'ounces', pound: 'pounds',
    milliliter: 'milliliters', liter: 'liters', teaspoon: 'teaspoons', tablespoon: 'tablespoons',
    cup: 'cups', gallon: 'gallons', millimeter: 'millimeters', centimeter: 'centimeters', meter: 'meters',
    inch: 'inches', foot: 'feet', piece: 'pieces', 'fluid ounce': 'fluid_ounces', 'fluid ounces': 'fluid_ounces'
  }
  if (singularToPlural[raw]) return singularToPlural[raw]
  if (singularToPlural[raw.replace(/s$/, '')]) return singularToPlural[raw.replace(/s$/, '')]

  const underscoreVariant = raw.replace(/\s+/g, '_')
  if ((measurementUnits as readonly string[]).includes(underscoreVariant)) return underscoreVariant
  if ((measurementUnits as readonly string[]).includes(raw)) return raw
  return undefined
}

const parseIngredientLine = (input: string): { name: string; quantity?: string; measurement?: string } => {
  const original = (input || '').trim()
  if (!original) return { name: '' }

  let rest = original
  let quantityText: string | undefined

  const qtyMatch = rest.match(/^\s*([\d]+\s+[\d]+\/[\d]+|[\d]+\/[\d]+|[\d]*\.?[\d]+(?:\s+[\d]+\/[\d]+)?|[\d]+(?:\s*-\s*[\d]+)?)/)
  if (qtyMatch) {
    const candidate = qtyMatch[1].trim()
    const parsed = parseQuantityToNumber(candidate)
    if (typeof parsed === 'number') {
      quantityText = candidate
      rest = rest.slice(qtyMatch[0].length).trim()
    }
  }

  // Build unit candidates (longest first)
  const unitSynonyms: string[] = [
    ...Object.values(UNIT_DISPLAY_SINGULAR).map((v) => v.toLowerCase()),
    ...measurementUnits.map((u) => u.replace(/_/g, ' ').toLowerCase()),
    'fluid ounce', 'fluid ounces'
  ]
  unitSynonyms.sort((a, b) => b.length - a.length)

  let foundUnit: string | undefined
  const lower = rest.toLowerCase()
  for (const syn of unitSynonyms) {
    if (!syn) continue
    if (lower.startsWith(syn + ' ') || lower === syn) {
      foundUnit = normalizeUnitToCanonical(syn)
      if (foundUnit) {
        rest = rest.slice(syn.length).trim()
        break
      }
    }
  }

  rest = rest.replace(/^of\s+/, '').trim()
  return { name: rest, quantity: quantityText, measurement: foundUnit }
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

  const parsedForIngredients = {
    ...inputWithMovedMedia,
    instructions: inputWithMovedMedia.instructions.map((instruction) => ({
      ...instruction,
      ingredients: (instruction.ingredients || []).map((ing) => {
        if (ing.isPrepared) return ing
        const parsed = parseIngredientLine(ing.name)
        return {
          ...ing,
          originalDisplayName: ing.name,
          name: parsed.name || ing.name,
          quantity: parsed.quantity ?? ing.quantity,
          measurement: parsed.measurement ?? ing.measurement
        }
      })
    }))
  }

  ensureRecipeHasIngredients(parsedForIngredients)

  const transformedInput = {
    ...parsedForIngredients,
    instructions: parsedForIngredients.instructions.map((instruction) => ({
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

  const parsedForIngredients = {
    ...inputWithMovedMedia,
    instructions: inputWithMovedMedia.instructions.map((instruction) => ({
      ...instruction,
      ingredients: (instruction.ingredients || []).map((ing) => {
        if (ing.isPrepared) return ing
        const parsed = parseIngredientLine(ing.name)
        return {
          ...ing,
          originalDisplayName: ing.name,
          name: parsed.name || ing.name,
          quantity: parsed.quantity ?? ing.quantity,
          measurement: parsed.measurement ?? ing.measurement
        }
      })
    }))
  }

  ensureRecipeHasIngredients(parsedForIngredients)

  const transformedInput = {
    ...parsedForIngredients,
    instructions: parsedForIngredients.instructions.map((instruction) => ({
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
