import { fail } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { recipe } from '$lib/server/db/schema'
import type { Actions } from './$types'
import { safeParse } from 'valibot'
import { recipeSchema } from '$lib/form-validation'
import type { Ingredient, MeasurementUnit } from '$lib/types'
import { generateId } from '$lib/server/id'
import { groupBy } from 'ramda'
import { api } from '$lib/server/food-api'
import { Result, Ok } from 'ts-results-es'
import { uploadImage } from '$lib/server/cloudinary'

type FormFields = {
  title: string
  description: string
  ingredients: Ingredient[]
  instructions: string[]
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

const parseInstructions = (formData: FormData): string[] => {
  return Array.from(formData.entries())
    .filter(([key]) => key.split('-')[0] === 'instructions')
    .map(([key, value]) => ({
      index: parseInt(key.split('-')[1]),
      value: value.toString()
    }))
    .sort((a, b) => a.index - b.index)
    .map(({ value }) => value)
}

const parseFormData = (formData: FormData): FormFields => ({
  title: formData.get('title')?.toString() ?? '',
  description: formData.get('description')?.toString() ?? '',
  ingredients: parseIngredients(formData),
  instructions: parseInstructions(formData)
})

export const actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData()
    const recipeData = parseFormData(formData)
    const imageFile = formData.get('image') as File | null

    const result = safeParse(recipeSchema, recipeData)

    if (!result.success) {
      return fail(400, {
        data: recipeData,
        errors: result.issues.map(issue => ({
          path: issue.path?.map(p => p.key).join('.')!,
          message: issue.message
        }))
      })
    }

    const mappedIngredientsResults = await Promise.all(
      recipeData.ingredients.map(async (ingredient) => {
        if (ingredient.custom) {
          return Ok({
            name: ingredient.name,
            quantity: ingredient.quantity,
            measurement: ingredient.measurement,
            custom: true as const
          })
        }
        return await api('mapIngredientToDatabaseEntry')(ingredient)
      })
    )

    const mappedIngredientsResult = Result.all(mappedIngredientsResults)

    if (mappedIngredientsResult.isErr()) {
      return fail(500, {
        error: mappedIngredientsResult.error
      })
    }

    const mappedIngredients = mappedIngredientsResult.value

    const nonCustomIngredients = mappedIngredients
        .filter(ing => !ing.custom)
        .map(ing => ({
          amount: ing.quantity,
          unit: ing.measurement,
          name: ing.name
        }))

    let nutrition = {
      totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      hasCustomIngredients: mappedIngredients.some(i => i.custom)
    }

    if (nonCustomIngredients.length > 0) {
      const nutritionResult = await api('getRecipeInfo')(nonCustomIngredients)

      if (nutritionResult.isOk()) {
        nutrition = {
        totalNutrition: {
          calories: nutritionResult.value.calories,
          protein: nutritionResult.value.protein,
          carbs: nutritionResult.value.carbs,
          fat: nutritionResult.value.fat
        },
          hasCustomIngredients: mappedIngredients.some(i => i.custom)
        }
      }
      }

    let imageUrl: string | null = null
    if (imageFile) {
      try {
        console.log('Starting image upload process...')
        console.log('Image file type:', imageFile.type)
        console.log('Image file size:', imageFile.size)
        
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        console.log('Successfully converted image to buffer')
        
        imageUrl = await uploadImage(buffer)
        console.log('Successfully uploaded image to Cloudinary:', imageUrl)
      } catch (err) {
        console.error('Failed to upload image. Error details:', err)
        // Continue without image if upload fails
      }
    } else {
      console.log('No image file provided in form data')
    }

    const newRecipe = await db.insert(recipe).values({
      id: generateId(),
      ...result.output,
      ingredients: mappedIngredients,
      nutrition,
      userId: locals.user?.id ?? null,
      imageUrl
    }).returning()

    return {
      success: true,
      recipeId: newRecipe[0].id
    }
  }
} satisfies Actions 