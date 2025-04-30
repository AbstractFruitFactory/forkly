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

const formValidationSchema = v.object({
  title: v.pipe(
    v.string(),
    v.transform(input => input ?? ''),
    v.minLength(1, 'Title is required')
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
    v.array(v.any()),
    v.minLength(1, 'At least one ingredient is required')
  ),
  instructions: v.pipe(
    v.array(v.any()),
    v.minLength(1, 'At least one instruction is required')
  ),
  tags: v.array(v.string())
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

const parseIngredients = (formData: FormData): Ingredient[] => {
  const ingredientEntries = Array.from(formData.entries())
    .filter(([key]) => key.split('-')[0] === 'ingredient')
    .map(([key, value]) => {
      const [_, index, field] = key.split('-')
      return { index: parseInt(index), field, value: value.toString() }
    })

  const byIndex = groupBy(entry => entry.index.toString(), ingredientEntries)

  return Object.values(byIndex).map(entries => {
    let quantity: number = 0
    let measurement: string = ''
    let displayName: string = ''

    entries!.forEach(({ field, value }) => {
      if (field === 'quantity') {
        quantity = parseFloat(value) || 0
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
  const instructions: FormFields['instructions'] = []
  let i = 0
  while (formData.has(`instructions-${i}-text`)) {
    const text = formData.get(`instructions-${i}-text`) as string
    const mediaFile = formData.get(`instructions-${i}-media`) as File | null

    if (text) {
      instructions.push({
        text,
        mediaUrl: undefined,
        mediaType: mediaFile ? (mediaFile.type.startsWith('video/') ? 'video' : 'image') : undefined
      })
    }
    i++
  }

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
    console.log('formData', formData)
    const recipeData = parseFormData(formData)
    const imageFile = formData.get('image') as File | undefined

    const instructionsWithMedia = await Promise.all(
      recipeData.instructions.map(async (instruction, index) => {
        const mediaFile = formData.get(`instructions-${index}-media`) as File | undefined

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

    const invalidIngredients = recipeData.ingredients.filter(
      ing => {
        console.log('ingredient', ing)
        return !ing.name || ing.name.trim() === ''
      }
    )

    if (invalidIngredients.length > 0) {
      return fail(400, {
        success: false,
        errors: [{
          path: 'ingredients',
          message: 'An ingredient cannot be empty'
        }]
      })
    }

    const invalidInstructions = recipeData.instructions.filter(
      inst => !inst.text || inst.text.trim() === ''
    )

    if (invalidInstructions.length > 0) {
      return fail(400, {
        success: false,
        errors: [{
          path: 'instructions',
          message: 'All instructions must have text'
        }]
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
          console.log('Exact match for', ing.displayName, '->', matchedName)
        } else {
          // Step 2: Fuzzy match
          const bestMatch = stringSimilarity.findBestMatch(normalizedInput, canonicalNames)
          if (bestMatch.bestMatch.rating > 0.85) {
            matchedName = bestMatch.bestMatch.target
            matchedId = canonicalIngredients.find(i => i.name === matchedName)?.id || ''
            console.log('Fuzzy match for', ing.displayName, '->', matchedName, 'rating:', bestMatch.bestMatch.rating)
          } else {
            // Step 3: Create new ingredient
            const newId = generateId()
            await db.insert(ingredientTable).values({ id: newId, name: normalizedInput })
            matchedName = normalizedInput
            matchedId = newId
            console.log('Created new ingredient for', ing.displayName, '->', matchedName)
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

    if (mappedIngredients.length > 0) {
      const nutritionResult = await api('getRecipeInfo')(mappedIngredients.map(ing => ({
        amount: ing.quantity,
        unit: ing.measurement,
        name: ing.name
      })))

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
      '/api/recipes/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      }
    )

    if (fetchResponse.isErr()) {
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