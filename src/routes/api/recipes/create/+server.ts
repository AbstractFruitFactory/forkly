import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { recipe, ingredient, recipeIngredient, recipeNutrition } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import * as v from 'valibot'
import { generateId } from '$lib/server/id'
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

  const recipeId = generateId()

  const newRecipe = await db.insert(recipe).values({
    id: recipeId,
    userId: locals.user?.id,
    title: input.data.title,
    description: input.data.description,
    instructions: input.instructions,
    diets: input.data.diets || [],
    imageUrl: input.imageUrl
  }).returning()

  await db.insert(recipeNutrition).values({
    recipeId: recipeId,
    calories: input.nutrition.totalNutrition.calories,
    protein: input.nutrition.totalNutrition.protein,
    carbs: input.nutrition.totalNutrition.carbs,
    fat: input.nutrition.totalNutrition.fat
  })

  for (const ingredientData of input.data.ingredients) {
    let ingredientId: string

    if (ingredientData.custom) {
      const newIngredient = await db.insert(ingredient).values({
        id: generateId(),
        name: ingredientData.name,
        spoonacularId: null,
        custom: true
      }).returning()
      ingredientId = newIngredient[0].id
    } else {
      const existingIngredient = await db
        .select()
        .from(ingredient)
        .where(eq(ingredient.spoonacularId, ingredientData.spoonacularId))
        .limit(1)

      if (!existingIngredient.length) {
        const newIngredient = await db.insert(ingredient).values({
          id: generateId(),
          name: ingredientData.name,
          spoonacularId: ingredientData.spoonacularId,
          custom: false
        }).returning()
        ingredientId = newIngredient[0].id
      } else {
        ingredientId = existingIngredient[0].id
      }
    }

    await db.insert(recipeIngredient).values({
      recipeId: recipeId,
      ingredientId: ingredientId,
      quantity: ingredientData.quantity,
      measurement: ingredientData.measurement
    })
  }

  return json(newRecipe[0])
} 