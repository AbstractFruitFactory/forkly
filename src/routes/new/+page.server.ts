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

    console.log('Validating recipe data:', JSON.stringify(recipeData, null, 2))
    const result = safeParse(recipeSchema, recipeData)

    if (!result.success) {
      console.log('Validation failed:', result.issues)
      return fail(400, {
        data: recipeData,
        errors: result.issues.map(issue => ({
          path: issue.path?.map(p => p.key).join('.')!,
          message: issue.message
        }))
      })
    }

    const mappedIngredients = await Promise.all(
      recipeData.ingredients.map(async (ingredient) => {
        return await api('mapIngredientToDatabaseEntry')(ingredient)
      })
    )

    const newRecipe = await db.insert(recipe).values({
      id: generateId(),
      ...result.output,
      ingredients: mappedIngredients,
      userId: locals.user?.id ?? null
    }).returning()

    return {
      success: true,
      recipeId: newRecipe[0].id
    }
  }
} satisfies Actions 