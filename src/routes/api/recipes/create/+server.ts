import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { recipe } from '$lib/server/db/schema'
import * as v from 'valibot'
import { generateId } from '$lib/server/id'
import type { MeasurementUnit } from '$lib/types'
import { measurementUnits } from '$lib/types'
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
  instructions: v.array(v.string()),
  nutrition: v.object({
    totalNutrition: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number()
    }),
    hasCustomIngredients: v.boolean()
  }),
  imageUrl: v.optional(v.string())
})



export const POST: RequestHandler = async ({ request, locals }) => {
  const data = await request.json()
  const validationResult = validate(createRecipeSchema, data)

  if (validationResult.isErr()) error(400, { message: validationResult.error.message })

  const input = validationResult.value

  const newRecipe = await db.insert(recipe).values({
    id: generateId(),
    userId: locals.user?.id,
    title: input.data.title,
    description: input.data.description,
    ingredients: input.data.ingredients,
    instructions: input.instructions,
    nutrition: input.nutrition,
    imageUrl: input.imageUrl,
    createdAt: new Date()
  }).returning()

  return json(newRecipe[0])

} 