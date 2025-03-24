import { db } from '.'
import { recipe, recipeLike, recipeDislike, recipeBookmark, recipeIngredient, ingredient, recipeNutrition, user } from './schema'
import { eq, ilike, desc, sql, inArray, and, count, SQL } from 'drizzle-orm'
import { nullToUndefined } from '$lib/utils/nullToUndefined'

export type BasicRecipe = {
  id: string
  title: string
  imageUrl?: string
  tags: string[]
  likes: number
}

export type DetailedRecipe = {
  id: string
  userId?: string
  title: string
  description?: string
  instructions: { text: string; mediaUrl?: string; mediaType?: "image" | "video" }[]
  tags: string[]
  imageUrl?: string
  createdAt: Date | string
  likes: number
  dislikes: number
  bookmarks: number
  ingredients: Array<{
    id: string
    name: string
    quantity: number
    measurement: string
    custom?: boolean
  }>
  nutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  user?: {
    username?: string
    avatarUrl?: string
  }
}

export type RecipeFilterBase = {
  query?: string
  tags?: string[]
  ingredients?: string[]
  recipeIds?: string[]
  userId?: string
  limit?: number
}

export type BasicRecipeFilter = RecipeFilterBase & { detailed?: false }
export type DetailedRecipeFilter = RecipeFilterBase & { detailed: true }
export type RecipeFilter = BasicRecipeFilter | DetailedRecipeFilter

export function getRecipes(filters: DetailedRecipeFilter): Promise<DetailedRecipe[]>
export function getRecipes(filters?: BasicRecipeFilter): Promise<BasicRecipe[]>
export async function getRecipes(filters: RecipeFilter = {}): Promise<BasicRecipe[] | DetailedRecipe[]> {
  const {
    query = '',
    tags = [],
    ingredients = [],
    recipeIds = [],
    userId,
    limit,
    detailed = false
  } = filters

  // Early return if all filters are empty unless explicitly searching for all recipes
  if (query.trim() === '' && tags.length === 0 && ingredients.length === 0 && recipeIds.length === 0 && !detailed) {
    return []
  }

  // Build where conditions
  const conditions: SQL<unknown>[] = []

  // Title search
  if (query.trim()) {
    const searchTerms = query.trim().split(/\s+/)
    
    // Handle each term independently with implicit OR logic
    for (const term of searchTerms) {
      conditions.push(ilike(recipe.title, `%${term}%`))
    }
  }

  // Tags filters
  if (tags.length > 0) {
    conditions.push(sql`${recipe.tags} ?| array[${tags.join(',')}]`)
  }

  // Recipe IDs filter
  if (recipeIds.length > 0) {
    const quotedIds = recipeIds.map(id => `'${id}'`).join(',')
    conditions.push(sql`${recipe.id} IN (${sql.raw(quotedIds)})`)
  }

  // User ID filter (for created recipes)
  if (userId) {
    conditions.push(eq(recipe.userId, userId))
  }

  // Create the final where condition
  const whereCondition = conditions.length === 0
    ? undefined
    : (conditions.length === 1 ? conditions[0] : and(...conditions))

  if (detailed) {
    // Build detailed query
    const detailedRecipeQuery = db
      .select({
        id: recipe.id,
        userId: recipe.userId,
        title: recipe.title,
        description: recipe.description,
        instructions: recipe.instructions,
        tags: recipe.tags,
        imageUrl: recipe.imageUrl,
        createdAt: recipe.createdAt,
        likes: sql<number>`count(DISTINCT ${recipeLike.userId})::int`,
        dislikes: sql<number>`count(DISTINCT ${recipeDislike.userId})::int`,
        bookmarks: sql<number>`count(DISTINCT ${recipeBookmark.userId})::int`,
        ingredients: sql<Array<{ id: string, name: string, quantity: number, measurement: string, custom?: boolean }>>`json_agg(
          json_build_object(
            'id', ${ingredient.id},
            'name', ${ingredient.name},
            'quantity', ${recipeIngredient.quantity},
            'measurement', ${recipeIngredient.measurement},
            'custom', ${ingredient.custom}
          )
        ) filter (where ${ingredient.id} is not null)`,
        nutrition: sql<{ calories: number, protein: number, carbs: number, fat: number }>`json_build_object(
          'calories', ${recipeNutrition.calories},
          'protein', ${recipeNutrition.protein},
          'carbs', ${recipeNutrition.carbs},
          'fat', ${recipeNutrition.fat}
        )`,
        user: {
          username: user.username,
          avatarUrl: user.avatarUrl
        }
      })
      .from(recipe)
      .leftJoin(user, eq(recipe.userId, user.id))
      .leftJoin(recipeLike, eq(recipe.id, recipeLike.recipeId))
      .leftJoin(recipeDislike, eq(recipe.id, recipeDislike.recipeId))
      .leftJoin(recipeBookmark, eq(recipe.id, recipeBookmark.recipeId))
      .leftJoin(recipeNutrition, eq(recipe.id, recipeNutrition.recipeId))
      .leftJoin(recipeIngredient, eq(recipe.id, recipeIngredient.recipeId))
      .leftJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))

    // Complete the query with the where condition if needed
    const queryWithWhere = whereCondition
      ? detailedRecipeQuery.where(whereCondition)
      : detailedRecipeQuery

    // Complete the query with groupBy, orderBy, and limit
    const finalQuery = queryWithWhere
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

    // Apply limit if provided
    const limitedQuery = limit ? finalQuery.limit(limit) : finalQuery

    // Handle ingredient filtering for detailed queries
    if (ingredients.length > 0) {
      const recipes = await limitedQuery

      return nullToUndefined(recipes.filter(r => {
        if (!r.ingredients) return false

        const recipeIngredientNames = r.ingredients.map(i => i.name.toLowerCase())
        return ingredients.every(ingredient =>
          recipeIngredientNames.some(name => name.includes(ingredient.toLowerCase()))
        )
      }))
    }

    const results = await limitedQuery
    return nullToUndefined(results)
  } else {
    // Basic query with limited fields
    const basicRecipeQuery = db
      .select({
        id: recipe.id,
        title: recipe.title,
        imageUrl: recipe.imageUrl,
        tags: recipe.tags,
        likes: sql<number>`count(${recipeLike.userId})::int`
      })
      .from(recipe)
      .leftJoin(recipeLike, eq(recipe.id, recipeLike.recipeId))

    // Complete the query with the where condition if needed
    const queryWithWhere = whereCondition
      ? basicRecipeQuery.where(whereCondition)
      : basicRecipeQuery

    // Complete query with groupBy, orderBy, and limit
    const finalQuery = queryWithWhere
      .groupBy(recipe.id)
      .orderBy(desc(recipe.createdAt))

    // Apply limit if provided
    const limitedQuery = limit ? finalQuery.limit(limit) : finalQuery

    // Handle ingredient filtering
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

      const results = await limitedQuery
        .innerJoin(
          recipesWithAllIngredients,
          eq(recipe.id, recipesWithAllIngredients.recipeId)
        )
      
      return nullToUndefined(results)
    }

    const results = await limitedQuery
    return nullToUndefined(results)
  }
}

/**
 * @deprecated Use getRecipes with appropriate filter options instead
 */
export async function searchRecipes(
  query: string,
  tags: string[] = [],
  ingredients: string[] = [],
  limit: number = 5
): Promise<BasicRecipe[]> {
  return getRecipes({
    query,
    tags,
    ingredients,
    limit
  })
}

/**
 * @deprecated Use getRecipes with appropriate filter options instead
 */
export async function searchRecipesByTitle(query: string, limit: number = 5): Promise<BasicRecipe[]> {
  return getRecipes({
    query,
    limit
  })
}

export async function getRecipeById(id: string) {
  const results = await db
    .select()
    .from(recipe)
    .where(eq(recipe.id, id))
    .limit(1)

  const result = results[0] || null
  return result ? nullToUndefined(result) : null
}

/**
 * @deprecated Use getRecipes with {detailed: true} instead
 */
export function getDetailedRecipeQuery(whereClause: SQL<unknown>): Promise<DetailedRecipe[]> {
  return getRecipes({
    detailed: true
  })
}

/**
 * Get recipes created by a user
 * @param userId The user ID
 * @returns An array of recipes created by the user
 * @deprecated Use getRecipes with {userId, detailed: true} instead
 */
export async function getUserCreatedRecipes(userId: string): Promise<DetailedRecipe[]> {
  return getRecipes({
    userId,
    detailed: true
  })
}

/**
 * Get recipes bookmarked by a user
 * @param recipeIds An array of recipe IDs
 * @returns An array of bookmarked recipes
 * @deprecated Use getRecipes with {recipeIds, detailed: true} instead
 */
export async function getRecipesByIds(recipeIds: string[]): Promise<DetailedRecipe[]> {
  if (recipeIds.length === 0) {
    return []
  }

  return getRecipes({
    recipeIds,
    detailed: true
  })
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
 * @param tags Array of tags to filter by
 * @param ingredients Array of ingredients to filter by
 * @returns Filtered recipes for the home page
 * @deprecated Use getRecipes with {query, tags, ingredients, detailed: true} instead
 */
export async function getHomePageRecipes(
  tags?: string[],
  ingredients?: string[],
  searchQuery?: string
): Promise<DetailedRecipe[]> {
  return getRecipes({
    query: searchQuery,
    tags,
    ingredients,
    detailed: true
  })
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
    tags: recipe.tags
  })
    .from(recipe)
    .where(eq(recipe.id, recipeId))

  const foundRecipe = recipes[0]
  if (!foundRecipe) return null

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
    measurement: ri.measurement,
    custom: ri.ingredient.custom
  }))

  const result = {
    ...foundRecipe,
    ingredients,
    nutrition,
    isLiked,
    isDisliked,
    likes: likes.length,
    dislikes: dislikes.length,
    isBookmarked,
    bookmarks: bookmarks.length
  }
  
  return nullToUndefined(result)
} 