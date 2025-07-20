import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import type { Ingredient } from '$lib/types'
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
  ingredients: v.pipe(
    v.array(ingredientSchema),
    v.minLength(1, 'At least one ingredient is required')
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
    ingredients?: Ingredient[]
    id?: string
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

const parseFormData = (formData: FormData): FormFields => {
  const tags = formData.getAll('tags').map(value => value.toString())

  const instructionsField = formData.get('instructions')?.toString() || '[]'
  const instructions: FormFields['instructions'] = JSON.parse(instructionsField)

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

export const actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData()
    const recipeData = parseFormData(formData)
    const imageFile = formData.get('image') as File | undefined

    const instructionsWithMedia = await Promise.all(
      recipeData.instructions.map(async (instruction) => {
        const mediaFile = formData.get(`instructions-${instruction.id}-media`) as File | undefined

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
            mediaUrl,
            mediaType: isVideo ? ('video' as const) : ('image' as const)
          }
        }

        return instruction
      })
    )

    recipeData.instructions = instructionsWithMedia

    // Aggregate ingredients from instructions
    const aggregatedMap = new Map<string, Ingredient>()
    for (const instr of recipeData.instructions) {
      for (const ing of instr.ingredients || []) {
        const key = `${ing.name.toLowerCase()}|${ing.measurement ?? ''}`
        if (aggregatedMap.has(key)) {
          const ex = aggregatedMap.get(key)!
          if (ing.quantity !== undefined) {
            ex.quantity = (ex.quantity ?? 0) + (ing.quantity ?? 0)
          }
        } else {
          aggregatedMap.set(key, { ...ing })
        }
      }
    }
    const aggregatedIngredients = Array.from(aggregatedMap.values())

    const result = v.safeParse(formValidationSchema, {
      title: recipeData.title,
      description: recipeData.description,
      servings: Number(recipeData.servings) || 1,
      ingredients: aggregatedIngredients,
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

    const canonicalIngredients = await getAllIngredients()
    const canonicalNames = canonicalIngredients.map(i => i.name)

    const mappedIngredientsResults = await Promise.all(
      aggregatedIngredients.map(async (ing) => {
        const normalizedInput = normalizeIngredientName(ing.name)
        let matchedName: string
        let matchedId: string

        // Step 1: Exact match
        const exact = canonicalIngredients.find(i => i.name.toLowerCase() === normalizedInput.toLowerCase())
        if (exact) {
          matchedName = exact.name
          matchedId = exact.id
        } else {
          // Step 2: Fuzzy match
          const bestMatch = stringSimilarity.findBestMatch(normalizedInput, canonicalNames)
          if (bestMatch.bestMatch.rating > 0.85) {
            matchedName = bestMatch.bestMatch.target
            matchedId = canonicalIngredients.find(i => i.name === matchedName)?.id || ''
          } else {
            // Step 3: Create new ingredient
            const newId = generateId()
            await db.insert(ingredientTable).values({ id: newId, name: normalizedInput })
            matchedName = normalizedInput
            matchedId = newId
          }
        }

        return Ok({
          name: matchedName,
          displayName: ing.displayName,
          quantity: ing.quantity,
          measurement: ing.measurement
        })
      })
    )

    const mappedIngredientsResult: Result<Ingredient[], { message: string }> = Result.all(mappedIngredientsResults)

    if (mappedIngredientsResult.isErr()) {
      return fail(500, {
        success: false,
        errors: [{
          path: 'ingredients',
          message: mappedIngredientsResult.error.message
        }]
      })
    }

    const mappedIngredients = mappedIngredientsResult.value as Ingredient[]

    let nutrition: typeof recipeData.manualNutrition | null = null
    if (recipeData.nutritionMode === 'manual') {
      nutrition = recipeData.manualNutrition ?? null
    } else if (recipeData.nutritionMode === 'auto') {
      const nutritionResult = await api('getRecipeInfo')(
        mappedIngredients.map(ing => ({
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

    let imageUrl: string | undefined = undefined
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      imageUrl = await uploadImage(buffer)
    }

    const formattedIngredients = mappedIngredients.map(ing => ({
      name: ing.name,
      displayName: ing.displayName,
      quantity: ing.quantity,
      measurement: ing.measurement
    }))

    const requestPayload = {
      title: recipeData.title,
      description: recipeData.description,
      servings: recipeData.servings,
      instructions: recipeData.instructions,
      ingredients: formattedIngredients,
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