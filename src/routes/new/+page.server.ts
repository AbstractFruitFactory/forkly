import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { measurementUnits, type Ingredient, type MeasurementUnit } from '$lib/types'
import groupBy from 'ramda/src/groupBy'
import { generateId } from '$lib/server/id'
import { api } from '$lib/server/food-api'
import { Ok, Result } from 'ts-results-es'
import * as v from 'valibot'
import { uploadImage } from '$lib/server/cloudinary'
import { recipe } from '$lib/server/db/schema'
import { db } from '$lib/server/db'

const baseIngredientSchema = {
  name: v.pipe(
    v.string(),
    v.transform(input => input ?? ''),
    v.minLength(1, 'Ingredient name is required'),
    v.maxLength(100, 'Ingredient name must be less than 100 characters')
  ),
  quantity: v.pipe(
    v.number('Please enter a valid number'),
    v.minValue(0, 'Quantity must be a positive number')
  ),
  measurement: v.pipe(
    v.string(),
    v.transform(input => input ?? ''),
    v.minLength(1, 'Measurement is required'),
    v.custom<MeasurementUnit>(
      (value) => measurementUnits.includes(value as MeasurementUnit),
      'Invalid measurement unit'
    )
  )
}

const lookupIngredientSchema = v.object({
  ...baseIngredientSchema,
  id: v.number('Missing ID for ingredient'),
  custom: v.literal(false)
})

const customIngredientSchema = v.object({
  ...baseIngredientSchema,
  custom: v.literal(true)
})

const ingredientSchema = v.union([lookupIngredientSchema, customIngredientSchema],
  'Ingredient validation failed'
)

const recipeSchema = v.object({
  title: v.pipe(
    v.string(),
    v.transform(input => input ?? ''),
    v.minLength(1, 'Title is required'),
    v.maxLength(100, 'Title must be less than 100 characters')
  ),
  description: v.pipe(
    v.string(),
    v.transform(input => input ?? ''),
    v.maxLength(500, 'Description must be less than 500 characters')
  ),
  ingredients: v.array(ingredientSchema),
  instructions: v.array(v.pipe(
    v.string(),
    v.transform(input => input ?? ''),
    v.minLength(1, 'Instruction step cannot be empty'),
    v.maxLength(1000, 'Instruction step must be less than 1000 characters')
  ))
})

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

    const result = v.safeParse(recipeSchema, recipeData)

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
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      imageUrl = await uploadImage(buffer)
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