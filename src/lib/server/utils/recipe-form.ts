import { fail } from '@sveltejs/kit'
import groupBy from 'ramda/src/groupBy'
import { api } from '$lib/server/food-api'
import * as v from 'valibot'
import { uploadImage, uploadMedia } from '$lib/server/cloudinary'
import { generateId } from '$lib/server/id'

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
  mediaUrl: v.optional(v.string()),
  mediaType: v.optional(v.union([v.literal('image'), v.literal('video')])),
  ingredients: v.optional(v.array(ingredientSchema))
})

export const formValidationSchema = v.object({
  title: v.pipe(
    v.string(),
    v.transform(input => input ?? ''),
    v.minLength(1, 'Title is required'),
    v.minLength(5, 'Title must be at least 5 characters'),
    v.maxLength(80, 'Title must be at most 80 characters')
  ),
  description: v.pipe(
    v.string(),
    v.transform(input => input ?? '')
  ),
  servings: v.pipe(
    v.number(),
    v.minValue(1, 'Servings must be at least 1')
  ),
  instructions: v.pipe(
    v.array(instructionSchema),
    v.minLength(1, 'At least one instruction is required')
  ),
  tags: v.pipe(
    v.array(v.string()),
    v.maxLength(3, 'A recipe can have at most 3 tags')
  )
})

export type FormFields = {
  title: string
  description: string
  servings: number
  instructions: {
    text: string
    mediaUrl?: string
    mediaType?: 'image' | 'video'
    ingredients?: {
      quantity?: string
      measurement?: string
      name: string
      displayName: string
      isPrepared?: boolean
    }[]
  }[]
  tags: string[]
  nutritionMode: 'auto' | 'manual' | 'none'
  manualNutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export type RecipeApiResponse = {
  id: string
  [key: string]: any
}

const parseIngredientOrInstruction = (formData: FormData, keyPrefix: string) =>
  Array.from(formData.entries())
    .filter(([key]) => key.startsWith(keyPrefix))
    .map(([key, value]) => {
      const [_, id, field] = key.split('-')
      return { id, field, value: value.toString() }
    })

const parseFormData = (formData: FormData): FormFields => {
  const tags = formData.getAll('tags').map(value => value.toString())

  const instructionEntries = parseIngredientOrInstruction(formData, 'instructions')
  const instructionById = groupBy(entry => entry.id, instructionEntries)

  const instructions: FormFields['instructions'] = Object.values(instructionById).map(entries => {
    let text = ''
    const ingredients: FormFields['instructions'][0]['ingredients'] = []

    for (const entry of entries!) {
      const { field, value } = entry
      if (field === 'text') {
        text = value
      }
    }

    const instructionId = entries![0]?.id
    if (instructionId) {
      const ingredientEntries = Array.from(formData.entries())
        .filter(([key]) => key.startsWith(`instructions-${instructionId}-ingredient-`))
        .map(([key, value]) => {
          const parts = key.split('-')
          const ingredientId = parts[3]
          const field = parts[4]
          return { id: ingredientId, field, value: value.toString() }
        })

      const ingredientById = groupBy(entry => entry.id, ingredientEntries)

      Object.values(ingredientById).forEach(ingredientEntries => {
        if (ingredientEntries) {
          let name = ''
          let quantity: string | undefined
          let measurement = ''
          let isPrepared = false

          for (const entry of ingredientEntries) {
            const { field, value } = entry
            if (field === 'name') {
              name = value
            } else if (field === 'amount') {
              quantity = value
            } else if (field === 'unit') {
              measurement = value
            } else if (field === 'isPrepared') {
              isPrepared = value === 'true' || value === '1'
            }
          }

          if (name) {
            ingredients.push({
              name,
              displayName: name,
              quantity: (isPrepared) ? undefined : quantity,
              measurement: (isPrepared) ? undefined : (measurement || undefined),
              isPrepared: isPrepared
            })
          }
        }
      })
    }

    return {
      text,
      mediaUrl: undefined,
      mediaType: undefined,
      ingredients: ingredients.length > 0 ? ingredients : undefined
    }
  })

  const nutritionMode = formData.get('nutritionMode')?.toString() as 'auto' | 'manual' | 'none' | undefined
  let manualNutrition: FormFields['manualNutrition'] = undefined
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

  return {
    title: formData.get('title')?.toString() ?? '',
    description: formData.get('description')?.toString() ?? '',
    servings: parseInt(formData.get('servings')?.toString() ?? '1') || 1,
    instructions,
    tags,
    nutritionMode: nutritionMode ?? 'auto',
    manualNutrition
  }
}

export const buildRecipePayloadFromForm = async (formData: FormData, skipValidation: boolean = false) => {
  const recipeData = parseFormData(formData)
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
    imageUrl = imageUrlFromClient
  }

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