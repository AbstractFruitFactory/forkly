import { db } from '.'
import { recipe, recipeLike, recipeDislike, recipeBookmark, recipeIngredient, ingredient, recipeNutrition, user } from './schema'
import { eq, ilike, or, desc, sql, inArray, and, count, SQL } from 'drizzle-orm'
import type { DietType } from '$lib/types'

export async function searchRecipes(
  query: string,
  diets: DietType[] = [],
  ingredients: string[] = [],
  limit: number = 5
) {
  if (query.trim() === '' && diets.length === 0 && ingredients.length === 0) {
    return []
  }

  const searchTerms = query.trim().split(/\s+/).map(term => `%${term}%`)
  const titleConditions = query.trim()
    ? searchTerms.map(term => ilike(recipe.title, term))
    : []

  const whereConditions = [
    ...(diets.length > 0 ? [sql`${recipe.diets} ?| array[${diets.join(',')}]`] : []),
    ...(titleConditions.length > 0 ? [or(...titleConditions)] : [])
  ]

  const baseQuery = db
    .select({
      id: recipe.id,
      title: recipe.title,
      imageUrl: recipe.imageUrl,
      diets: recipe.diets,
      likes: sql<number>`count(${recipeLike.userId})::int`
    })
    .from(recipe)
    .leftJoin(recipeLike, eq(recipe.id, recipeLike.recipeId))
    .groupBy(recipe.id)
    .orderBy(desc(recipe.createdAt))
    .limit(limit)

  if (ingredients.length > 0) {
    const recipesWithAllIngredients = db
      .select({
        recipeId: recipeIngredient.recipeId,
        ingredientCount: count()
      })
      .from(recipeIngredient)
      .innerJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
      .where(inArray(ingredient.name, ingredients))
      .groupBy(recipeIngredient.recipeId)
      .having(eq(count(), ingredients.length))
      .as('recipes_with_all_ingredients')

    return baseQuery
      .innerJoin(
        recipesWithAllIngredients,
        eq(recipe.id, recipesWithAllIngredients.recipeId)
      )
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
  } else {
    return baseQuery
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
  }
}

export async function searchRecipesByTitle(query: string, limit: number = 5) {
  return searchRecipes(query, [], [], limit)
}

export async function getRecipeById(id: string) {
  const results = await db
    .select()
    .from(recipe)
    .where(eq(recipe.id, id))
    .limit(1)

  return results[0] || null
}

export function getDetailedRecipeQuery(whereClause: SQL<unknown>) {
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
      likes: sql<number>`count(DISTINCT${recipeLike.userId})::int`,
      dislikes: sql<number>`count(DISTINCT${recipeDislike.userId})::int`,
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
    .leftJoin(recipeDislike, eq(recipe.id, recipeDislike.recipeId))
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

/**
 * Get recipes created by a user
 * @param userId The user ID
 * @returns An array of recipes created by the user
 */
export async function getUserCreatedRecipes(userId: string) {
  return getDetailedRecipeQuery(eq(recipe.userId, userId))
}

/**
 * Get recipes bookmarked by a user
 * @param recipeIds An array of recipe IDs
 * @returns An array of bookmarked recipes
 */
export async function getRecipesByIds(recipeIds: string[]) {
  if (recipeIds.length === 0) {
    return []
  }

  const quotedIds = recipeIds.map(id => `'${id}'`).join(',')
  return getDetailedRecipeQuery(sql`${recipe.id} IN (${sql.raw(quotedIds)})`)
}

/**
 * Delete a recipe
 * @param recipeId The recipe ID
 * @param userId The user ID (for authorization)
 * @returns Whether the recipe was deleted
 */
export async function deleteRecipe(recipeId: string, userId: string) {
  const recipeToDelete = await db
    .select()
    .from(recipe)
    .where(and(
      eq(recipe.id, recipeId),
      eq(recipe.userId, userId)
    ))
    .limit(1)

  if (!recipeToDelete.length) {
    return false
  }

  await db.delete(recipe).where(eq(recipe.id, recipeId))
  return true
}

/**
 * Get recipes for the home page with filtering options
 * @param searchQuery The search query for recipe titles
 * @param diets Array of diet types to filter by
 * @param ingredients Array of ingredients to filter by
 * @returns Filtered recipes for the home page
 */
export async function getHomePageRecipes(
  diets: DietType[],
  ingredients: string[],
  searchQuery: string | null
) {
  let whereCondition: SQL<unknown> | undefined
  const conditions = []

  if (searchQuery) {
    const searchTerms = searchQuery.trim().split(/\s+/).map((term) => `%${term}%`)
    const searchConditions = searchTerms.map((term) => ilike(recipe.title, term))
    conditions.push(or(...searchConditions))
  }

  if (diets.length > 0) {
    conditions.push(sql`${recipe.diets} ?| array[${diets.join(',')}]`)
  }

  if (ingredients.length > 0) {
    conditions.push(sql`EXISTS (
      SELECT 1 FROM recipe_ingredient ri
      JOIN ingredient i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = ${recipe.id}
      AND i.name ILIKE ANY (ARRAY[${ingredients.map(i => `%${i}%`)}])
      GROUP BY ri.recipe_id
      HAVING COUNT(*) = ${ingredients.length}
    )`)
  }

  if (conditions.length > 0) {
    whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions)
  }

  let recipes = await db
    .select({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      instructions: recipe.instructions,
      imageUrl: recipe.imageUrl,
      diets: recipe.diets,
      createdAt: recipe.createdAt,
      likes: sql<number>`count(DISTINCT ${recipeLike.userId})::int`,
      dislikes: sql<number>`count(DISTINCT ${recipeDislike.userId})::int`,
      bookmarks: sql<number>`count(DISTINCT ${recipeBookmark.userId})::int`,
      calories: recipeNutrition.calories,
      protein: recipeNutrition.protein,
      carbs: recipeNutrition.carbs,
      fat: recipeNutrition.fat,
      user: {
        username: user.username,
        avatarUrl: user.avatarUrl
      },
      ingredients: sql<Array<{
        id: string
        name: string
        quantity: number
        measurement: string
      }>>`json_agg(
        json_build_object(
          'id', ${ingredient.id},
          'name', ${ingredient.name},
          'quantity', ${recipeIngredient.quantity},
          'measurement', ${recipeIngredient.measurement}
        )
      ) filter (where ${ingredient.id} is not null)`
    })
    .from(recipe)
    .leftJoin(user, eq(recipe.userId, user.id))
    .leftJoin(recipeLike, eq(recipe.id, recipeLike.recipeId))
    .leftJoin(recipeDislike, eq(recipe.id, recipeDislike.recipeId))
    .leftJoin(recipeBookmark, eq(recipe.id, recipeBookmark.recipeId))
    .leftJoin(recipeNutrition, eq(recipe.id, recipeNutrition.recipeId))
    .leftJoin(recipeIngredient, eq(recipe.id, recipeIngredient.recipeId))
    .leftJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
    .where(whereCondition)
    .groupBy(
      recipe.id,
      user.username,
      user.avatarUrl,
      recipeNutrition.calories,
      recipeNutrition.protein,
      recipeNutrition.carbs,
      recipeNutrition.fat
    )
    .orderBy(desc(recipe.createdAt))

  return recipes
}

/**
 * Get a recipe by ID with all its details including ingredients, nutrition, likes, and bookmarks
 * @param recipeId The recipe ID
 * @param userId Optional user ID to check if the recipe is liked/bookmarked by the user
 * @returns The recipe with all its details
 */
export async function getRecipeWithDetails(recipeId: string, userId?: string) {
  const recipes = await db.select({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    instructions: recipe.instructions,
    imageUrl: recipe.imageUrl,
    diets: recipe.diets
  })
    .from(recipe)
    .where(eq(recipe.id, recipeId))

  const foundRecipe = recipes[0]
  if (!foundRecipe) return null

  // Get recipe ingredients
  const recipeIngredients = await db
    .select({
      ingredient: ingredient,
      quantity: recipeIngredient.quantity,
      measurement: recipeIngredient.measurement
    })
    .from(recipeIngredient)
    .innerJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
    .where(eq(recipeIngredient.recipeId, recipeId))

  const nutritionData = await db
    .select()
    .from(recipeNutrition)
    .where(eq(recipeNutrition.recipeId, recipeId))

  const nutrition = nutritionData[0] || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  }

  // Get like status if user is logged in
  let isLiked = false
  let isDisliked = false
  let isBookmarked = false
  if (userId) {
    const likes = await db
      .select()
      .from(recipeLike)
      .where(and(
        eq(recipeLike.recipeId, recipeId),
        eq(recipeLike.userId, userId)
      ))
    isLiked = likes.length > 0

    const dislikes = await db
      .select()
      .from(recipeDislike)
      .where(and(
        eq(recipeDislike.recipeId, recipeId),
        eq(recipeDislike.userId, userId)
      ))
    isDisliked = dislikes.length > 0

    const bookmarks = await db
      .select()
      .from(recipeBookmark)
      .where(and(
        eq(recipeBookmark.recipeId, recipeId),
        eq(recipeBookmark.userId, userId)
      ))
    isBookmarked = bookmarks.length > 0
  }

  const likes = await db
    .select()
    .from(recipeLike)
    .where(eq(recipeLike.recipeId, recipeId))

  const dislikes = await db
    .select()
    .from(recipeDislike)
    .where(eq(recipeDislike.recipeId, recipeId))

  const bookmarks = await db
    .select()
    .from(recipeBookmark)
    .where(eq(recipeBookmark.recipeId, recipeId))

  const ingredients = recipeIngredients.map(ri => ({
    id: ri.ingredient.id,
    name: ri.ingredient.name,
    quantity: ri.quantity,
    measurement: ri.measurement
  }))

  return {
    ...foundRecipe,
    ingredients,
    nutrition,
    isLiked,
    isDisliked,
    likes: likes.length,
    isBookmarked,
    bookmarks: bookmarks.length
  }
} 