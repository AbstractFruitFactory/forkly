import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { createRecipe } from '$lib/server/db/recipe-create'
import * as v from 'valibot'
import { isValidTag } from '$lib/types'

const baseIngredientSchema = v.object({
  name: v.string(),
  displayName: v.string(),
  quantity: v.optional(v.number()),
  measurement: v.optional(v.string())
})

const createRecipeSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1)),
  description: v.optional(v.string()),
  servings: v.pipe(v.number(), v.minValue(1)),
  ingredients: v.array(
    baseIngredientSchema
  ),
  instructions: v.array(v.object({
    text: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union([v.literal('image'), v.literal('video')]))
  })),
  nutrition: v.object({
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number()
  }),
  tags: v.array(
    v.pipe(
      v.string(),
      v.custom(
        (value) => isValidTag(value as string),
        'Tags must be less than 15 characters'
      )
    ),
    [v.maxLength(3, 'A recipe can have at most 3 tags')]
  ),
  imageUrl: v.optional(v.string())
})

export const POST: RequestHandler = async ({ request, locals }) => {
  const data = await request.json()
  const validationResult = v.safeParse(createRecipeSchema, data)

  if (!validationResult.success) error(400, { message: validationResult.issues.map(issue => issue.message).join(', ') })

  const input = validationResult.output

  const newRecipe = await createRecipe(input, locals.user?.id)
  return json(newRecipe)
} 