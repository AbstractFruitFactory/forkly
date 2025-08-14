import * as v from 'valibot'

export const ingredientSchema = v.pipe(
  v.object({
    quantity: v.optional(v.string()),
    measurement: v.optional(v.string()),
    name: v.pipe(v.string(), v.transform((input) => input ?? ''), v.minLength(1, 'An ingredient cannot be empty')),
    isPrepared: v.optional(v.boolean())
  }),
  v.rawTransform(({ dataset, addIssue }) => {
    if (
      !dataset.value.isPrepared &&
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
  text: v.pipe(v.string(), v.transform((input) => input ?? ''), v.minLength(1, 'All instructions must have text')),
  mediaUrl: v.optional(v.string()),
  mediaType: v.optional(v.union([v.literal('image'), v.literal('video')])),
  ingredients: v.optional(v.array(ingredientSchema))
})

export const formValidationSchema = v.object({
  title: v.pipe(
    v.string(),
    v.transform((input) => input ?? ''),
    v.minLength(1, 'Title is required'),
    v.minLength(5, 'Title must be at least 5 characters'),
    v.maxLength(80, 'Title must be at most 80 characters')
  ),
  description: v.pipe(v.string(), v.transform((input) => input ?? '')),
  servings: v.pipe(v.number(), v.minValue(1, 'Servings must be at least 1')),
  instructions: v.pipe(v.array(instructionSchema), v.minLength(1, 'At least one instruction is required')),
  tags: v.pipe(v.array(v.string()), v.maxLength(3, 'A recipe can have at most 3 tags'))
})

export type FormFields = {
  title: string
  description: string
  servings: number
  instructions: {
    text: string
    mediaUrl?: string
    mediaType?: 'image' | 'video'
    ingredients?: {
      quantity?: string
      measurement?: string
      name: string
      displayName: string
      isPrepared?: boolean
    }[]
  }[]
  tags: string[]
  nutritionMode: 'auto' | 'manual' | 'none'
  manualNutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
} 