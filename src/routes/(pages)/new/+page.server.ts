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
  ingredients: Ingredient[]
  instructions: {
    text: string
    mediaUrl?: string
    mediaType?: 'image' | 'video'
  }[]
  tags: string[]
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

const parseIngredients = (formData: FormData): Ingredient[] => {
  const ingredientEntries = parseIngredientOrInstruction(formData, 'ingredient')

  const byIndex = groupBy(entry => entry.id, ingredientEntries)

  return Object.values(byIndex).map(entries => {
    let quantity: number | undefined = undefined
    let measurement: string | undefined = undefined
    let displayName: string = ''

    entries!.forEach(({ field, value }) => {
      if (field === 'quantity') {
        quantity = value ? parseFloat(value) : undefined
      } else if (field === 'measurement') {
        measurement = value
      } else if (field.startsWith('name')) {
        displayName = value
      }
    })

    return {
      quantity,
      measurement,
      name: displayName,
      displayName
    }
  })
}

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

  return {
    title: formData.get('title')?.toString() ?? '',
    description: formData.get('description')?.toString() ?? '',
    servings: parseInt(formData.get('servings')?.toString() ?? '1') || 1,
    ingredients: parseIngredients(formData),
    instructions,
    tags
  }
}

export const actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData()
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
            mediaUrl,
            mediaType: isVideo ? ('video' as const) : ('image' as const)
          }
        }

        return instruction
      })
    )

    recipeData.instructions = instructionsWithMedia

    const result = v.safeParse(formValidationSchema, {
      title: recipeData.title,
      description: recipeData.description,
      servings: Number(recipeData.servings) || 1,
      ingredients: recipeData.ingredients,
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
      recipeData.ingredients.map(async (ing) => {
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

    let nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }


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