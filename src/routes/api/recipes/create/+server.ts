import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { createRecipe } from '$lib/server/db/recipe-create'
import * as v from 'valibot'
import { isValidTag, measurementUnits } from '$lib/types'

const baseIngredientSchema = v.pipe(
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

const createRecipeSchema = v.object({
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
    v.array(baseIngredientSchema),
    v.minLength(1, 'At least one ingredient is required')
  ),
  instructions: v.pipe(
    v.array(instructionSchema),
    v.minLength(1, 'At least one instruction is required')
  ),
  nutrition: v.object({
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number()
  }),
  tags: v.pipe(
    v.array(
      v.pipe(
        v.string(),
        v.custom(
          (value) => isValidTag(value as string),
          'Tags must be less than 15 characters'
        )
      )
    ),
    v.maxLength(3, 'A recipe can have at most 3 tags')
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