import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import groupBy from 'ramda/src/groupBy'
import { api } from '$lib/server/food-api'
import * as v from 'valibot'
import { uploadImage, uploadMedia } from '$lib/server/cloudinary'
import { safeFetch } from '$lib/utils/fetch'

const ingredientSchema = v.pipe(
  v.object({
    quantity: v.optional(v.string()),
    measurement: v.optional(v.string()),
    name: v.pipe(
      v.string(),
      v.transform(input => input ?? ''),
      v.minLength(1, 'An ingredient cannot be empty')
    ),
    displayName: v.string()
  }),
  v.rawTransform(({ dataset, addIssue }) => {
    if (
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

const instructionSchema = v.object({
  text: v.pipe(
    v.string(),
    v.transform(input => input ?? ''),
    v.minLength(1, 'All instructions must have text')
  ),
  mediaUrl: v.optional(v.string()),
  mediaType: v.optional(v.union([v.literal('image'), v.literal('video')])),
  ingredients: v.optional(v.array(ingredientSchema))
})

const formValidationSchema = v.object({
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

type FormFields = {
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

type RecipeApiResponse = {
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

          for (const entry of ingredientEntries) {
            const { field, value } = entry
            if (field === 'name') {
              name = value
            } else if (field === 'amount') {
              quantity = value
            } else if (field === 'unit') {
              measurement = value
            }
          }

          if (name) {
            ingredients.push({
              name,
              displayName: name,
              quantity,
              measurement: measurement || undefined
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

const buildRecipePayloadFromForm = async (formData: FormData, skipValidation: boolean = false) => {
  const recipeData = parseFormData(formData)
  const imageFile = formData.get('image') as File | undefined

  const instructionEntries = parseIngredientOrInstruction(formData, 'instructions')
  const instructionById = groupBy(entry => entry.id, instructionEntries)

  const instructionsWithMedia = await Promise.all(
    recipeData.instructions.map(async (instruction, index) => {
      const instructionId = Object.keys(instructionById)[index]
      const mediaFile = formData.get(`instructions-${instructionId}-media`) as File | undefined

      if (mediaFile && mediaFile.size > 0) {
        const arrayBuffer = await mediaFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const isVideo = mediaFile.type.startsWith('video/')
        const mediaUrl = await uploadMedia(buffer, {
          folder: 'instruction-media',
          resource_type: isVideo ? 'video' : 'image'
        })
        return {
          ...instruction,
          id: instructionId,
          mediaUrl,
          mediaType: isVideo ? ('video' as const) : ('image' as const)
        }
      }
      return {
        ...instruction,
        id: instructionId
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
  if (imageFile && imageFile.size > 0) {
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    imageUrl = await uploadImage(buffer)
  }

  const instructionsWithIds = recipeData.instructions.map((instruction, index) => {
    const instructionId = Object.keys(instructionById)[index]
    return {
      ...instruction,
      id: instructionId
    }
  })

  const allIngredients = instructionsWithIds.flatMap(instruction => instruction.ingredients || [])
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
    const allIngredients = instructionsWithIds.flatMap(instruction => instruction.ingredients || [])
    const nutritionResult = await api('getRecipeInfo')(
      allIngredients.map(ing => ({
        amount: ing.quantity ? parseFloat(ing.quantity) : undefined,
        unit: ing.measurement,
        name: ing.name
      })),
      recipeData.instructions.map(i => i.text).join('\n'),
      recipeData.servings
    )
    if (nutritionResult.isOk()) {
      nutrition = {
        calories: nutritionResult.value.calories,
        protein: nutritionResult.value.protein,
        carbs: nutritionResult.value.carbs,
        fat: nutritionResult.value.fat
      }
    }
  }

  return {
    payload: {
      title: recipeData.title,
      description: recipeData.description,
      servings: recipeData.servings,
      instructions: instructionsWithIds,
      nutrition: nutrition,
      tags: recipeData.tags,
      imageUrl
    }
  }
}

export const actions = {
  create: async ({ request, fetch }) => {
    const formData = await request.formData()
    const { payload, error } = await buildRecipePayloadFromForm(formData)
    if (error) return error

    const fetchResponse = await safeFetch<RecipeApiResponse>(fetch)(
      '/recipes/create',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    )
    if (fetchResponse.isErr()) {
      console.error('Error creating recipe', fetchResponse.error)
      return fail(500, {
        success: false,
        errors: [{
          path: 'api',
          message: 'An unexpected error occurred while creating the recipe'
        }]
      })
    }

    if (formData.get('draft') === 'true') {
      const draftId = formData.get('id')?.toString()
      const deleteResponse = await safeFetch(fetch)(`/recipes/draft/${draftId}`, {
        method: 'DELETE'
      })
      if (deleteResponse.isErr()) {
        console.error('Failed to delete draft', deleteResponse.error)
      }
    }

    return {
      success: true,
      recipeId: fetchResponse.value.id
    }
  },
  update: async ({ request, fetch }) => {
    const formData = await request.formData()
    const recipeId = formData.get('id')?.toString()
    if (!recipeId) {
      return fail(400, {
        success: false,
        errors: [{
          path: 'id',
          message: 'Recipe ID is required for updates'
        }]
      })
    }

    const { payload, error } = await buildRecipePayloadFromForm(formData)
    if (error) return error

    const fetchResponse = await safeFetch<RecipeApiResponse>(fetch)(
      '/recipes/update',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: recipeId })
      }
    )
    if (fetchResponse.isErr()) {
      console.error('Error updating recipe', fetchResponse.error)
      return fail(500, {
        success: false,
        errors: [{
          path: 'api',
          message: 'An unexpected error occurred while updating the recipe'
        }]
      })
    }
    return {
      success: true,
      recipeId: fetchResponse.value.id
    }
  },
  saveDraft: async ({ request, fetch, locals }) => {
    const { user } = locals
    if (!user) {
      return fail(401, {
        success: false,
        errors: [{ path: 'user', message: 'Unauthorized' }]
      })
    }
    const formData = await request.formData()
    const draftId = formData.get('id')?.toString()
    const { payload, error } = await buildRecipePayloadFromForm(formData, true)
    if (error) {
      console.error(error?.data.errors)
      return error
    }

    let fetchResponse = await safeFetch<RecipeApiResponse>(fetch)(
      draftId ? `/recipes/draft/${draftId}` : '/recipes/draft',
      {
        method: draftId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    )

    if (fetchResponse.isErr()) {
      console.error('Error saving draft', fetchResponse.error)
      return fail(500, {
        success: false,
        errors: [{
          path: 'api',
          message: 'An unexpected error occurred while saving the draft'
        }]
      })
    }

    redirect(302, `/user/${user.username}?tab=Drafts`)
  }
} satisfies Actions 