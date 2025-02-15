import { fail, redirect } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { recipe } from '$lib/server/db/schema'
import type { Actions, PageServerLoad } from './$types'
import { safeParse } from 'valibot'
import { recipeSchema } from '$lib/form-validation'
import type { Ingredient, MeasurementUnit } from '$lib/types'

export const load: PageServerLoad = async () => {
  return {}
}

export const actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    const ingredients: Ingredient[] = []
    const instructions: string[] = []

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('ingredients')) {
        const match = key.match(/ingredients(\d+)(quantity|name|measurement)/)
        if (match) {
          const index = parseInt(match[1])
          const field = match[2] as 'quantity' | 'name' | 'measurement'

          if (field === 'quantity') {
            ingredients[index].quantity = parseFloat(value as string) || 0
          } else {
            ingredients[index][field] = value as MeasurementUnit
          }
        }
      } else if (key.startsWith('instructions')) {
        const match = key.match(/instructions(\d+)/)
        if (match) {
          instructions[parseInt(match[1])] = value as string
        }
      }
    }

    const recipeData = {
      title,
      description,
      ingredients,
      instructions
    }

    const result = safeParse(recipeSchema, recipeData)

    if (!result.success) {
      return fail(400, {
        data: recipeData,
        errors: result.issues.map(issue => ({
          path: issue.path?.map(p => p.key).join('.'),
          message: issue.message
        }))
      })
    }

    const newRecipe = await db.insert(recipe).values({
      ...result.output,
      userId: locals.user?.id ?? null
    }).returning()

    console.log(newRecipe)

    redirect(302, '/')
  }
} satisfies Actions 