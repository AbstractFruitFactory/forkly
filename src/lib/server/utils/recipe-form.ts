import { fail } from '@sveltejs/kit'
import groupBy from 'ramda/src/groupBy'
import { api } from '$lib/server/food-api'
import * as v from 'valibot'
import { uploadImage, uploadMedia, moveToFolder } from '$lib/server/cloudinary'
import { generateId } from '$lib/server/id'
import { formValidationSchema } from '$lib/validation/recipe-form.schema'
import { parseFormData, type FormFields } from '$lib/validation/parse-recipe-form'

export const ingredientSchema = v.pipe(
  v.object({
    quantity: v.optional(v.string()),
    measurement: v.optional(v.string()),
    name: v.pipe(
      v.string(),
      v.transform(input => input ?? ''),
      v.minLength(1, 'An ingredient cannot be empty')
    ),
    displayName: v.string(),
    isPrepared: v.optional(v.boolean())
  }),
  v.rawTransform(({ dataset, addIssue }) => {
    if (
      !dataset.value.isPrepared &&
      dataset.value.measurement !== undefined && dataset.value.measurement !== '' &&
      (dataset.value.quantity === undefined || dataset.value.quantity.trim() === '')
    ) {
      addIssue({
        message: 'A quantity is required if a measurement is specified',
        path: [
          {
            type: 'object',
            origin: 'value',
            input: dataset.value,
            key: 'quantity',
            value: dataset.value.quantity
          }
        ]
      })
    }
    return dataset.value
  })
)

export const instructionSchema = v.object({
  text: v.pipe(
    v.string(),
    v.transform(input => input ?? ''),
    v.minLength(1, 'All instructions must have text')
  ),
  hint: v.optional(v.string()),
  mediaUrl: v.optional(v.string()),
  mediaType: v.optional(v.union([v.literal('image'), v.literal('video')])),
  ingredients: v.optional(v.array(ingredientSchema))
})

const parseIngredientOrInstruction = (formData: FormData, keyPrefix: string) =>
  Array.from(formData.entries())
    .filter(([key]) => key.startsWith(keyPrefix))
    .map(([key, value]) => {
      const [_, id, field] = key.split('-')
      return { id, field, value: value.toString() }
    })

export const buildRecipePayloadFromForm = async (formData: FormData, skipValidation: boolean = false) => {
  const parsed = parseFormData(formData)
  const nutritionMode = formData.get('nutritionMode')?.toString() as 'auto' | 'manual' | 'none' | undefined
  let manualNutrition: { calories: number; protein: number; carbs: number; fat: number } | undefined
  if (nutritionMode === 'manual') {
    const protein = parseFloat(formData.get('protein')?.toString() || '0')
    const carbs = parseFloat(formData.get('carbs')?.toString() || '0')
    const fat = parseFloat(formData.get('fat')?.toString() || '0')
    manualNutrition = {
      calories: protein * 4 + carbs * 4 + fat * 9,
      protein,
      carbs,
      fat
    }
  }
  const recipeData = {
    ...parsed,
    nutritionMode: nutritionMode ?? 'auto',
    manualNutrition
  } as unknown as FormFields & { nutritionMode: 'auto' | 'manual' | 'none'; manualNutrition?: { calories: number; protein: number; carbs: number; fat: number } }

  const imageUrlFromClient = formData.get('image-url')?.toString()

  const instructionEntries = parseIngredientOrInstruction(formData, 'instructions')
  const instructionById = groupBy(entry => entry.id, instructionEntries)

  const instructionsWithMedia = await Promise.all(
    recipeData.instructions.map(async (instruction, index) => {
      const clientInstructionId = Object.keys(instructionById)[index]
      const mediaUrl = formData.get(`instructions-${clientInstructionId}-media-url`)?.toString()
      const mediaType = formData.get(`instructions-${clientInstructionId}-media-type`)?.toString()

      if (mediaUrl) {
        return {
          ...instruction,
          id: generateId(),
          mediaUrl,
          mediaType: mediaType === 'video' ? ('video' as const) : ('image' as const)
        }
      }
      return {
        ...instruction,
        id: generateId()
      }
    })
  )
  recipeData.instructions = instructionsWithMedia

  if (!skipValidation) {
    const result = v.safeParse(formValidationSchema, {
      title: recipeData.title,
      description: recipeData.description,
      servings: Number(recipeData.servings) || 1,
      instructions: recipeData.instructions,
      tags: recipeData.tags
    })

    if (!result.success) {
      return {
        error: fail(400, {
          success: false,
          errors: result.issues.map(issue => ({
            path: issue.path?.map(p => p.key).join('.') || '',
            message: issue.message
          }))
        })
      }
    }
  }

  let imageUrl: string | undefined = undefined
  if (imageUrlFromClient) {
    let finalUrl = imageUrlFromClient
    if (finalUrl.includes('-tmp') || finalUrl.includes('/anonymous-media')) {
      try {
        finalUrl = await moveToFolder(finalUrl, 'recipe-images', 'image')
      } catch {}
    }
    imageUrl = finalUrl
  }

  const movedInstructions = await Promise.all(
    recipeData.instructions.map(async (ins) => {
      if (!ins.mediaUrl) return ins
      let finalUrl = ins.mediaUrl
      if (finalUrl.includes('-tmp') || finalUrl.includes('/anonymous-media')) {
        try {
          finalUrl = await moveToFolder(finalUrl, 'instruction-media', ins.mediaType === 'video' ? 'video' : 'image')
        } catch {}
      }
      return {
        ...ins,
        mediaUrl: finalUrl
      }
    })
  )
  recipeData.instructions = movedInstructions

  const allIngredients = recipeData.instructions.flatMap(instruction => (instruction.ingredients || []).filter(i => !i.isPrepared))
  if (allIngredients.length === 0 && !skipValidation) {
    return {
      error: fail(400, {
        success: false,
        errors: [{
          path: 'ingredients',
          message: 'Recipe must have at least one ingredient'
        }]
      })
    }
  }

  let nutrition: typeof recipeData.manualNutrition | null = null
  if (recipeData.nutritionMode === 'manual') {
    nutrition = recipeData.manualNutrition ?? null
  } else if (recipeData.nutritionMode === 'auto') {
    const autoCalories = parseFloat(formData.get('autoCalories')?.toString() || '')
    const autoProtein = parseFloat(formData.get('autoProtein')?.toString() || '')
    const autoCarbs = parseFloat(formData.get('autoCarbs')?.toString() || '')
    const autoFat = parseFloat(formData.get('autoFat')?.toString() || '')
    const hasAuto = [autoCalories, autoProtein, autoCarbs, autoFat].every((v) => Number.isFinite(v))
    if (hasAuto) {
      nutrition = {
        calories: autoCalories,
        protein: autoProtein,
        carbs: autoCarbs,
        fat: autoFat
      }
    }
  }

  return {
    payload: {
      title: recipeData.title,
      description: recipeData.description,
      servings: recipeData.servings,
      instructions: recipeData.instructions,
      nutrition: nutrition,
      tags: recipeData.tags,
      imageUrl
    }
  }
}

export type ClientInstruction = {
  text: string
  hint?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video'
  ingredients?: {
    quantity?: string
    measurement?: string
    name: string
    isPrepared?: boolean
  }[]
}

export type ClientRecipeInput = {
  title: string
  description: string
  servings: number
  instructions: ClientInstruction[]
  tags: string[]
  imageUrl?: string
  nutrition?: { calories: number; protein: number; carbs: number; fat: number } | null
}