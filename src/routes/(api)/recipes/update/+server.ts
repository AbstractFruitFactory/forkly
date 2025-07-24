import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { updateRecipe } from '$lib/server/db/recipe'
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
  id: v.string(),
  text: v.pipe(
    v.string(),
    v.transform(input => input ?? ''),
    v.minLength(1, 'All instructions must have text')
  ),
  mediaUrl: v.optional(v.string()),
  mediaType: v.optional(v.union([v.literal('image'), v.literal('video')])),
  ingredients: v.optional(v.array(baseIngredientSchema))
})

const updateRecipeSchema = v.object({
  id: v.string(),
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
  instructions: v.pipe(
    v.array(instructionSchema),
    v.minLength(1, 'At least one instruction is required')
  ),
  nutrition: v.optional(
    v.union([
      v.null_(),
      v.object({
        calories: v.number(),
        protein: v.number(),
        carbs: v.number(),
        fat: v.number()
      })
    ])
  ),
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
  imageUrl: v.optional(v.string()),
  draft: v.optional(v.boolean())
})

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const validationResult = v.safeParse(updateRecipeSchema, data)

  if (!validationResult.success) {
    error(400, { message: validationResult.issues.map(issue => issue.message).join(', ') })
  }

  const input = validationResult.output

  // Validate that the recipe has at least one ingredient
  const allIngredients = input.instructions.flatMap(instruction => instruction.ingredients || [])
  if (allIngredients.length === 0) {
    error(400, { message: 'Recipe must have at least one ingredient' })
  }

  const success = await updateRecipe(input.id, locals.user.id, {
    title: input.title,
    description: input.description,
    servings: input.servings,
    instructions: input.instructions.map(instruction => ({
      ...instruction,
      ingredients: instruction.ingredients?.map(ingredient => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        measurement: ingredient.measurement,
        displayName: ingredient.displayName
      }))
    })),
    nutrition: input.nutrition,
    tags: input.tags,
    imageUrl: input.imageUrl,
    draft: input.draft
  })

  if (!success) {
    error(404, { message: 'Recipe not found or you do not have permission to update it' })
  }

  return json({ success: true })
} 