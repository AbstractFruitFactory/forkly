import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import type { Ingredient } from '$lib/types'
import groupBy from 'ramda/src/groupBy'
import { api } from '$lib/server/food-api'
import { Ok, Result } from 'ts-results-es'
import * as v from 'valibot'
import { uploadImage, uploadMedia } from '$lib/server/cloudinary'
import { safeFetch } from '$lib/utils/fetch'
import { normalizeIngredientName } from '$lib/server/utils/normalize-ingredient'
import stringSimilarity from 'string-similarity'
import { getAllIngredients } from '$lib/server/db/ingredient'
import { db } from '$lib/server/db'
import { ingredient as ingredientTable } from '$lib/server/db/schema'
import { generateId } from '$lib/server/id'

const ingredientSchema = v.pipe(
  v.object({
    quantity: v.optional(v.number()),
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
      (dataset.value.quantity === undefined || isNaN(dataset.value.quantity))
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
  mediaType: v.optional(v.union([v.literal('image'), v.literal('video')]))
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
  ingredients: v.array(ingredientSchema),
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
  ingredients: Ingredient[]
  instructions: {
    text: string
    mediaUrl?: string
    mediaType?: 'image' | 'video'
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

  // Parse instructions
  const instructionEntries = parseIngredientOrInstruction(formData, 'instructions')
  const instructionById = groupBy(entry => entry.id, instructionEntries)

  const instructions: FormFields['instructions'] = Object.values(instructionById).map(entries => {
    let text = ''

    for (const entry of entries!) {
      const { field, value } = entry
      if (field === 'text') {
        text = value
      }
    }

    return {
      text,
      mediaUrl: undefined,
      mediaType: undefined
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
    ingredients: [], // Ingredients are now scoped to instructions, so this is empty
    instructions,
    tags,
    nutritionMode: nutritionMode ?? 'auto',
    manualNutrition
  }
}

export const actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData()
    console.log(formData)
    const recipeData = parseFormData(formData)
    const imageFile = formData.get('image') as File | undefined

    // Parse instructions again to get the IDs for media lookup
    const instructionEntries = parseIngredientOrInstruction(formData, 'instructions')
    const instructionById = groupBy(entry => entry.id, instructionEntries)

    const instructionsWithMedia = await Promise.all(
      recipeData.instructions.map(async (instruction, index) => {
        // Find the instruction ID from the parsed data
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

    const result = v.safeParse(formValidationSchema, {
      title: recipeData.title,
      description: recipeData.description,
      servings: Number(recipeData.servings) || 1,
      ingredients: [], // Ingredients are now scoped to instructions
      instructions: recipeData.instructions,
      tags: recipeData.tags
    })

    if (!result.success) {
      return fail(400, {
        success: false,
        errors: result.issues.map(issue => ({
          path: issue.path?.map(p => p.key).join('.') || '',
          message: issue.message
        }))
      })
    }

    let imageUrl: string | undefined = undefined
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      imageUrl = await uploadImage(buffer)
    }

    // Parse ingredients per instruction from form data
    const ingredientEntries = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('instructions-') && key.includes('-ingredient-'))
      .map(([key, value]) => {
        // Parse: instructions-{instructionId}-ingredient-{ingredientId}-{field}
        const parts = key.split('-')
        const instructionId = parts[1]
        const ingredientId = parts[3]
        const field = parts[4]
        return { instructionId, ingredientId, field, value: value.toString() }
      })

    const ingredientsByInstruction = new Map<string, Array<{
      name: string
      displayName: string
      quantity?: number
      measurement?: string
    }>>()

    // Group ingredients by their instruction ID
    const ingredientGroups = new Map<string, Map<string, { [key: string]: string }>>()

    for (const entry of ingredientEntries) {
      if (!ingredientGroups.has(entry.instructionId)) {
        ingredientGroups.set(entry.instructionId, new Map())
      }

      const instructionIngredients = ingredientGroups.get(entry.instructionId)!
      if (!instructionIngredients.has(entry.ingredientId)) {
        instructionIngredients.set(entry.ingredientId, {})
      }

      const ingredient = instructionIngredients.get(entry.ingredientId)!
      ingredient[entry.field] = entry.value
    }

    // Convert grouped ingredients to the expected format
    for (const [instructionId, ingredientMap] of ingredientGroups) {
      const ingredients: Array<{
        name: string
        displayName: string
        quantity?: number
        measurement?: string
      }> = []

      for (const [ingredientId, ingredientData] of ingredientMap) {
        if (ingredientData.name) {
          ingredients.push({
            name: ingredientData.name,
            displayName: ingredientData.name,
            quantity: ingredientData.amount ? parseFloat(ingredientData.amount) : undefined,
            measurement: ingredientData.unit
          })
        }
      }

      ingredientsByInstruction.set(instructionId, ingredients)
    }

    // Add ingredients to instructions
    const instructionsWithIngredients = recipeData.instructions.map((instruction, index) => {
      const instructionId = Object.keys(instructionById)[index]
      const instructionIngredients = ingredientsByInstruction.get(instructionId) || []
      return {
        ...instruction,
        id: instructionId,
        ingredients: instructionIngredients
      }
    })

    // Validate that the recipe has at least one ingredient
    const allIngredients = instructionsWithIngredients.flatMap(instruction => instruction.ingredients || [])
    if (allIngredients.length === 0) {
      return fail(400, {
        success: false,
        errors: [{
          path: 'ingredients',
          message: 'Recipe must have at least one ingredient'
        }]
      })
    }

    // Calculate nutrition after instructions are processed
    let nutrition: typeof recipeData.manualNutrition | null = null
    if (recipeData.nutritionMode === 'manual') {
      nutrition = recipeData.manualNutrition ?? null
    } else if (recipeData.nutritionMode === 'auto') {
      // Collect all ingredients from all instructions for nutrition calculation
      const allIngredients = instructionsWithIngredients.flatMap(instruction => instruction.ingredients || [])
      const nutritionResult = await api('getRecipeInfo')(
        allIngredients.map(ing => ({
          amount: ing.quantity,
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

    const requestPayload = {
      title: recipeData.title,
      description: recipeData.description,
      servings: recipeData.servings,
      instructions: instructionsWithIngredients,
      nutrition: nutrition,
      tags: recipeData.tags,
      imageUrl
    }

    const fetchResponse = await safeFetch<RecipeApiResponse>(fetch)(
      '/recipes/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
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

    return {
      success: true,
      recipeId: fetchResponse.value.id
    }
  }
} satisfies Actions 