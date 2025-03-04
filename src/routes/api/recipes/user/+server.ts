import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { recipe, recipeLike, recipeBookmark, recipeIngredient, ingredient, recipeNutrition } from '$lib/server/db/schema'
import { eq, desc, sql, SQL } from 'drizzle-orm'

const recipeQuery = (whereClause: SQL<unknown>) => {
  return db
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
      bookmarks: sql<number>`count(DISTINCT ${recipeBookmark.userId})::int`,
      ingredients: sql<Array<{ id: string, name: string, quantity: number, measurement: string }>>`json_agg(
        json_build_object(
          'id', ${ingredient.id},
          'name', ${ingredient.name},
          'quantity', ${recipeIngredient.quantity},
          'measurement', ${recipeIngredient.measurement}
        )
      ) filter (where ${ingredient.id} is not null)`,
      nutrition: sql<{ calories: number, protein: number, carbs: number, fat: number }>`json_build_object(
        'calories', ${recipeNutrition.calories},
        'protein', ${recipeNutrition.protein},
        'carbs', ${recipeNutrition.carbs},
        'fat', ${recipeNutrition.fat}
      )`
    })
    .from(recipe)
    .leftJoin(recipeLike, eq(recipe.id, recipeLike.recipeId))
    .leftJoin(recipeBookmark, eq(recipe.id, recipeBookmark.recipeId))
    .leftJoin(recipeIngredient, eq(recipe.id, recipeIngredient.recipeId))
    .leftJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
    .leftJoin(recipeNutrition, eq(recipe.id, recipeNutrition.recipeId))
    .where(whereClause)
    .groupBy(
      recipe.id,
      recipe.userId,
      recipe.title,
      recipe.description,
      recipe.instructions,
      recipe.diets,
      recipe.imageUrl,
      recipe.createdAt,
      recipeNutrition.calories,
      recipeNutrition.protein,
      recipeNutrition.carbs,
      recipeNutrition.fat
    )
    .orderBy(desc(recipe.createdAt))
}

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const createdRecipes = await recipeQuery(eq(recipe.userId, locals.user.id))

  const bookmarkedIds = await db
    .select({ recipeId: recipeBookmark.recipeId })
    .from(recipeBookmark)
    .where(eq(recipeBookmark.userId, locals.user.id))

  type RecipeResult = Awaited<ReturnType<typeof recipeQuery>>[number]

  let bookmarkedRecipes: RecipeResult[] = []

  if (bookmarkedIds.length > 0) {
    const recipeIds = bookmarkedIds.map(b => b.recipeId)
    const quotedIds = recipeIds.map(id => `'${id}'`).join(',')

    bookmarkedRecipes = await recipeQuery(
      sql`${recipe.id} IN (${sql.raw(quotedIds)})`
    )
  }

  const createdWithType = createdRecipes.map(r => ({
    ...r,
    type: 'created'
  }))

  const bookmarkedWithType = bookmarkedRecipes.map(r => ({
    ...r,
    type: 'bookmarked'
  }))

  return json({
    created: createdWithType,
    bookmarked: bookmarkedWithType
  })
} 