import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { type Ingredient, type MeasurementUnit, type DietType } from '$lib/types'
import groupBy from 'ramda/src/groupBy'
import { api } from '$lib/server/food-api'
import { Ok, Result } from 'ts-results-es'
import * as v from 'valibot'
import { uploadImage, uploadMedia } from '$lib/server/cloudinary'
import { safeFetch } from '$lib/utils/fetch'

type ExtendedIngredient = Ingredient & {
  spoonacularId?: number
}

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
  ingredients: v.pipe(
    v.array(v.any()),
    v.minLength(1, 'At least one ingredient is required')
  ),
  instructions: v.pipe(
    v.array(v.any()),
    v.minLength(1, 'At least one instruction is required')
  ),
  diets: v.array(v.string())
})

type FormFields = {
  title: string
  description: string
  ingredients: Ingredient[]
  instructions: {
    text: string
    mediaUrl?: string
    mediaType?: 'image' | 'video'
  }[]
  diets: DietType[]
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

  console.log('ingredientEntries', ingredientEntries)

  const byIndex = groupBy(entry => entry.index.toString(), ingredientEntries)

  return Object.values(byIndex).map(entries => {
    let quantity: number | undefined = undefined
    let measurement: MeasurementUnit | undefined = undefined
    let name: string | undefined = undefined
    let custom: boolean | undefined = undefined
    let lookupData: any = undefined

    entries!.forEach(({ field, value }) => {
      if (field === 'quantity') {
        quantity = parseFloat(value) || 0
      } else if (field === 'measurement') {
        measurement = value as MeasurementUnit
      } else if (field.startsWith('name')) {
        name = value
        custom = field.split('&')[1] === 'custom'
      } else if (field === 'lookupdata') {
        lookupData = JSON.parse(value)
        custom = false
      }
    })

    return {
      quantity,
      measurement,
      name,
      custom,
      ...(lookupData ? lookupData : {})
    }
  })
}

const parseFormData = (formData: FormData): FormFields => {
  const diets = formData.getAll('diets').map(value => value.toString()) as DietType[]

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
    ingredients: parseIngredients(formData),
    instructions,
    diets
  }
}

export const actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData()
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
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      diets: recipeData.diets
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

    console.log('recipeData', recipeData)

    const invalidIngredients = recipeData.ingredients.filter(
      ing => !ing.name || ing.quantity === undefined || !ing.measurement
    )

    if (invalidIngredients.length > 0) {
      return fail(400, {
        success: false,
        errors: [{
          path: 'ingredients',
          message: 'All ingredients must have a name, quantity, and measurement unit'
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

    const mappedIngredientsResults = await Promise.all(
      recipeData.ingredients.map(async (ing) => {
        if (ing.custom) {
          return Ok({
            name: ing.name,
            quantity: ing.quantity,
            measurement: ing.measurement,
            custom: true as const
          })
        }
        return await api('mapIngredientToDatabaseEntry')(ing)
      })
    )

    const mappedIngredientsResult = Result.all(mappedIngredientsResults)

    if (mappedIngredientsResult.isErr()) {
      return fail(500, {
        error: mappedIngredientsResult.error
      })
    }

    const mappedIngredients = mappedIngredientsResult.value as ExtendedIngredient[]

    const nonCustomIngredients = mappedIngredients
      .filter(ing => !ing.custom)
      .map(ing => ({
        amount: ing.quantity,
        unit: ing.measurement,
        name: ing.name
      }))

    let nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }

    if (nonCustomIngredients.length > 0) {
      const nutritionResult = await api('getRecipeInfo')(nonCustomIngredients)

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
      quantity: ing.quantity,
      measurement: ing.measurement,
      custom: ing.custom,
      spoonacularId: ing.spoonacularId
    }))

    const requestPayload = {
      title: recipeData.title,
      description: recipeData.description,
      instructions: recipeData.instructions,
      ingredients: formattedIngredients,
      nutrition: {
        totalNutrition: nutrition,
        hasCustomIngredients: mappedIngredients.some(ing => ing.custom)
      },
      diets: recipeData.diets,
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
        error: 'An unexpected error occurred while creating the recipe'
      })
    }

    return {
      success: true,
      recipeId: fetchResponse.value.id
    }
  }
} satisfies Actions 