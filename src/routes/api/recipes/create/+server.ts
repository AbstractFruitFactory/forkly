import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { createRecipe } from '$lib/server/db/recipe-create'
import * as v from 'valibot'
import type { MeasurementUnit, DietType } from '$lib/types'
import { measurementUnits, dietTypes } from '$lib/types'
import { validate } from '$lib/utils/validate'

const baseIngredientSchema = v.object({
  name: v.string(),
  quantity: v.number(),
  measurement: v.pipe(
    v.string(),
    v.custom<MeasurementUnit>(
      (value) => measurementUnits.includes(value as MeasurementUnit),
      'Invalid measurement unit'
    )
  )
})

const createRecipeSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1)),
  description: v.pipe(v.string(), v.minLength(1)),
  ingredients: v.array(
    v.union([
      v.intersect([
        baseIngredientSchema,
        v.object({
          custom: v.literal(true)
        })
      ]),
      v.intersect([
        baseIngredientSchema,
        v.object({
          custom: v.literal(false),
          spoonacularId: v.number(),
        })
      ]),
      v.intersect([
        baseIngredientSchema,
        v.object({
          custom: v.literal(false),
          openfoodfactsId: v.number(),
        })
      ]),
      v.intersect([
        baseIngredientSchema,
        v.object({
          custom: v.literal(false),
          usdaId: v.number(),
        })
      ])
    ])
  ),
  instructions: v.array(v.object({
    text: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union([v.literal('image'), v.literal('video')]))
  })),
  nutrition: v.object({
    totalNutrition: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number()
    }),
    hasCustomIngredients: v.boolean()
  }),
  diets: v.array(
    v.pipe(
      v.string(),
      v.custom<DietType>(
        (value) => dietTypes.includes(value as DietType),
        'Invalid diet type'
      )
    )
  ),
  imageUrl: v.optional(v.string())
})

export const POST: RequestHandler = async ({ request, locals }) => {
  const data = await request.json()
  const validationResult = validate(createRecipeSchema, data)

  if (validationResult.isErr()) error(400, { message: validationResult.error.message })

  const input = validationResult.value

  const newRecipe = await createRecipe(input.data, locals.user?.id)
  return json(newRecipe)
} 