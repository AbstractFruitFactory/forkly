import * as v from 'valibot'
import { isValidTag } from '$lib/types'
import { parseQuantityToNumber } from '$lib/utils/unitConversion'

export const baseIngredientSchema = v.pipe(
  v.object({
    quantity: v.optional(v.string()),
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
      (dataset.value.quantity === undefined || dataset.value.quantity.trim() === '')
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

export const instructionSchema = v.object({
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

export const baseRecipeSchema = v.object({
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
  imageUrl: v.optional(v.string())
})

export const createRecipeSchema = baseRecipeSchema
export const updateRecipeSchema = v.object({
  id: v.string(),
  ...baseRecipeSchema.entries
})



export const validateAndTransformRecipe = (data: unknown, isUpdate = false) => {
  const schema = isUpdate ? updateRecipeSchema : createRecipeSchema
  const validationResult = v.safeParse(schema, data)

  if (!validationResult.success) {
    throw new Error(validationResult.issues.map(issue => issue.message).join(', '))
  }

  const input = validationResult.output

  const allIngredients = input.instructions.flatMap(instruction => instruction.ingredients || [])
  if (allIngredients.length === 0) {
    throw new Error('Recipe must have at least one ingredient')
  }

  const transformedInput = {
    ...input,
    instructions: input.instructions.map(instruction => ({
      ...instruction,
      ingredients: instruction.ingredients?.map(ingredient => ({
        ...ingredient,
        quantity: typeof ingredient.quantity === 'string' && ingredient.quantity.trim() !== ''
          ? { text: ingredient.quantity, numeric: parseQuantityToNumber(ingredient.quantity) }
          : undefined
      }))
    }))
  }

  return transformedInput
} 