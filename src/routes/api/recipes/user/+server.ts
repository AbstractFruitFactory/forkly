import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { recipe, recipeLike, recipeIngredient, ingredient, recipeNutrition } from '$lib/server/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const recipes = await db
    .select({
      id: recipe.id,
      userId: recipe.userId,
      title: recipe.title,
      description: recipe.description,
      instructions: recipe.instructions,
      diets: recipe.diets,
      imageUrl: recipe.imageUrl,
      createdAt: recipe.createdAt,
      likes: sql<number>`count(${recipeLike.userId})::int`,
      ingredients: sql<Array<{id: string, name: string, quantity: number, measurement: string}>>`json_agg(
        json_build_object(
          'id', ${ingredient.id},
          'name', ${ingredient.name},
          'quantity', ${recipeIngredient.quantity},
          'measurement', ${recipeIngredient.measurement}
        )
      ) filter (where ${ingredient.id} is not null)`,
      nutrition: sql<{calories: number, protein: number, carbs: number, fat: number}>`json_build_object(
        'calories', ${recipeNutrition.calories},
        'protein', ${recipeNutrition.protein},
        'carbs', ${recipeNutrition.carbs},
        'fat', ${recipeNutrition.fat}
      )`
    })
    .from(recipe)
    .leftJoin(recipeLike, eq(recipe.id, recipeLike.recipeId))
    .leftJoin(recipeIngredient, eq(recipe.id, recipeIngredient.recipeId))
    .leftJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
    .leftJoin(recipeNutrition, eq(recipe.id, recipeNutrition.recipeId))
    .where(eq(recipe.userId, locals.user.id))
    .groupBy(recipe.id, recipeNutrition.calories, recipeNutrition.protein, recipeNutrition.carbs, recipeNutrition.fat)
    .orderBy(desc(recipe.createdAt))

  return json(recipes)
} 