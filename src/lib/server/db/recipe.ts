import { db } from '.'
import { recipe, recipeLike, recipeIngredient, ingredient, recipeNutrition, user, recipeBookmark, recipeTag, tag } from './schema'
import { eq, ilike, desc, sql, and, SQL, or } from 'drizzle-orm'
import { nullToUndefined } from '$lib/utils/nullToUndefined'

function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''")
}

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
  createdAt: Date
  likes: number
  bookmarks: number
  servings: number
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
  excludedIngredients?: string[]
  recipeIds?: string[]
  userId?: string
  limit?: number
  page?: number
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
    excludedIngredients = [],
    recipeIds = [],
    userId,
    limit = 18,
    page = 0,
    detailed = false
  } = filters

  // Early return if all filters are empty unless explicitly searching for all recipes
  if (query.trim() === '' && tags.length === 0 && ingredients.length === 0 && excludedIngredients.length === 0 && recipeIds.length === 0 && !detailed) {
    return []
  }

  // Build where conditions
  const conditions: SQL<unknown>[] = []

  // Title search
  if (query.trim()) {
    const searchTerms = query.trim().split(/\s+/)

    // Handle each term independently with implicit OR logic
    for (const term of searchTerms) {
      const titleCondition = ilike(recipe.title, `%${term}%`)
      const tagCondition = sql`EXISTS (SELECT 1 FROM recipe_tag rt WHERE rt.recipe_id = ${recipe.id} AND rt.tag_name ILIKE ${'%' + term + '%'})`
      const ingredientCondition = ilike(ingredient.name, `%${term}%`)

      const validConditions = [titleCondition, tagCondition, ingredientCondition].filter(Boolean)

      if (validConditions.length > 0) {
        conditions.push(or(...validConditions) as any)
      }
    }
  }

  // Tags filters
  if (tags.length > 0) {
    const quoted = tags.map(t => `'${t}'`).join(',')
    conditions.push(sql`${recipe.id} IN (SELECT recipe_id FROM recipe_tag WHERE tag_name IN (${sql.raw(quoted)}))`)
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

  // Ingredient filtering using raw SQL subquery
  if (ingredients.length > 0) {
    const ingredientsList = ingredients.map(ing => `'${escapeSqlString(ing)}'`).join(',')
    conditions.push(sql`${recipe.id} IN (
      SELECT ri.recipe_id 
      FROM recipe_ingredient ri
      JOIN ingredient i ON ri.ingredient_id = i.id
      WHERE i.name IN (${sql.raw(ingredientsList)})
      GROUP BY ri.recipe_id
      HAVING COUNT(DISTINCT i.name) = ${ingredients.length}
    )`)
  }

  // Excluded ingredient filtering using raw SQL subquery
  if (excludedIngredients.length > 0) {
    const excludedList = excludedIngredients.map(ing => `'${escapeSqlString(ing)}'`).join(',')
    conditions.push(sql`${recipe.id} NOT IN (
      SELECT ri.recipe_id 
      FROM recipe_ingredient ri
      JOIN ingredient i ON ri.ingredient_id = i.id
      WHERE i.name IN (${sql.raw(excludedList)})
      GROUP BY ri.recipe_id
    )`)
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
        tags: sql<string[]>`coalesce(array_agg(distinct ${recipeTag.tagName}), '{}')`,
        imageUrl: recipe.imageUrl,
        createdAt: recipe.createdAt,
        servings: recipe.servings,
        likes: sql<number>`count(DISTINCT ${recipeLike.userId})::int`,
        ingredients: sql<Array<{ id: string, name: string, quantity: number, measurement: string, custom?: boolean }>>`json_agg(
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
        )`,
        user: {
          username: user.username,
          avatarUrl: user.avatarUrl
        }
      })
      .from(recipe)
      .leftJoin(user, eq(recipe.userId, user.id))
      .leftJoin(recipeLike, eq(recipe.id, recipeLike.recipeId))
      .leftJoin(recipeNutrition, eq(recipe.id, recipeNutrition.recipeId))
      .leftJoin(recipeIngredient, eq(recipe.id, recipeIngredient.recipeId))
      .leftJoin(recipeTag, eq(recipe.id, recipeTag.recipeId))
      .leftJoin(tag, eq(recipeTag.tagName, tag.name))
      .leftJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))

    // Complete the query with the where condition if needed
    const queryWithWhere = whereCondition
      ? detailedRecipeQuery.where(whereCondition)
      : detailedRecipeQuery

    // Complete the query with groupBy, orderBy, and limit
    const finalQuery = queryWithWhere
      .groupBy(
        recipe.id,
        recipe.userId,
        recipe.title,
        recipe.description,
        recipe.instructions,
        recipe.imageUrl,
        recipe.createdAt,
        recipe.servings,
        user.username,
        user.avatarUrl,
        recipeNutrition.calories,
        recipeNutrition.protein,
        recipeNutrition.carbs,
        recipeNutrition.fat
      )
      .orderBy(desc(recipe.createdAt), desc(recipe.id))
      .offset(page * limit)

    // Apply limit if provided
    const limitedQuery = limit ? finalQuery.limit(limit) : finalQuery

    const results = await limitedQuery
    return nullToUndefined(results)
  } else {
    // Basic query with limited fields
    const basicRecipeQuery = db
      .select({
        id: recipe.id,
        title: recipe.title,
        imageUrl: recipe.imageUrl,
        tags: sql<string[]>`coalesce(array_agg(distinct ${recipeTag.tagName}), '{}')`,
        likes: sql<number>`count(${recipeLike.userId})::int`
      })
      .from(recipe)
      .leftJoin(recipeLike, eq(recipe.id, recipeLike.recipeId))
      .leftJoin(recipeTag, eq(recipe.id, recipeTag.recipeId))

    // Complete the query with the where condition if needed
    const queryWithWhere = whereCondition
      ? basicRecipeQuery.where(whereCondition)
      : basicRecipeQuery

    // Complete query with groupBy, orderBy, and limit
    const finalQuery = queryWithWhere
      .groupBy(recipe.id)
      .orderBy(desc(recipe.createdAt), desc(recipe.id))
      .offset(page * limit)

    // Apply limit if provided
    const limitedQuery = limit ? finalQuery.limit(limit) : finalQuery

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
    servings: recipe.servings,
    createdAt: recipe.createdAt,
    userId: recipe.userId
  })
    .from(recipe)
    .where(eq(recipe.id, recipeId))

  const foundRecipe = recipes[0]
  if (!foundRecipe) return null

  const tagRows = await db
    .select({ tag: recipeTag.tagName })
    .from(recipeTag)
    .where(eq(recipeTag.recipeId, recipeId))

  const tags = tagRows.map(r => r.tag)

  const recipeIngredients = await db
    .select({
      ingredient: ingredient,
      quantity: recipeIngredient.quantity,
      measurement: recipeIngredient.measurement,
      displayName: recipeIngredient.displayName
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
  let isSaved = false
  if (userId) {
    const likes = await db
      .select()
      .from(recipeLike)
      .where(and(
        eq(recipeLike.recipeId, recipeId),
        eq(recipeLike.userId, userId)
      ))
    isLiked = likes.length > 0

    const bookmarks = await db
      .select()
      .from(recipeBookmark)
      .where(and(
        eq(recipeBookmark.recipeId, recipeId),
        eq(recipeBookmark.userId, userId)
      ))
    isSaved = bookmarks.length > 0
  }

  const likes = await db
    .select()
    .from(recipeLike)
    .where(eq(recipeLike.recipeId, recipeId))

  const ingredients = recipeIngredients.map(ri => ({
    id: ri.ingredient.id,
    name: ri.ingredient.name,
    quantity: ri.quantity,
    measurement: ri.measurement,
    displayName: ri.displayName
  }))

  const result = {
    ...foundRecipe,
    tags,
    ingredients,
    nutrition,
    isLiked,
    isSaved,
    likes: likes.length
  }

  return nullToUndefined(result)
}

export type RecipeSimilarityScore = {
  recipeId: string
  score: number
}

const calculateIngredientSimilarity = (ingredients1: DetailedRecipe['ingredients'], ingredients2: DetailedRecipe['ingredients']): number => {
  if (!ingredients1?.length || !ingredients2?.length) return 0

  const normalized1 = ingredients1.map(i => ({
    name: i.name.toLowerCase(),
    quantity: i.quantity
  }))
  const normalized2 = ingredients2.map(i => ({
    name: i.name.toLowerCase(),
    quantity: i.quantity
  }))

  let totalSimilarity = 0
  let totalIngredients = Math.max(normalized1.length, normalized2.length)

  for (const ing1 of normalized1) {
    const matchingIng = normalized2.find(ing2 => ing2.name === ing1.name)
    if (matchingIng) {
      const quantityDiff = Math.abs(ing1.quantity - matchingIng.quantity)
      const maxQuantity = Math.max(ing1.quantity, matchingIng.quantity)
      const quantitySimilarity = 1 - (quantityDiff / maxQuantity)
      totalSimilarity += quantitySimilarity
    }
  }

  return totalSimilarity / totalIngredients
}

const calculateTagSimilarity = (tags1: string[], tags2: string[]): number => {
  if (!tags1?.length || !tags2?.length) return 0

  const set1 = new Set(tags1.map(t => t.toLowerCase()))
  const set2 = new Set(tags2.map(t => t.toLowerCase()))

  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

const calculateTitleSimilarity = (title1: string, title2: string): number => {
  if (!title1 || !title2) return 0

  const words1 = new Set(title1.toLowerCase().split(/\s+/))
  const words2 = new Set(title2.toLowerCase().split(/\s+/))

  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

export const getSimilarRecipes = async (recipeId: string, limit: number = 5) => {
  // Get the target recipe
  const targetRecipe = await getRecipes({ recipeIds: [recipeId], detailed: true })
  if (!targetRecipe.length) {
    return []
  }

  // Get all other recipes
  const allRecipes = await getRecipes({ detailed: true })
  const otherRecipes = allRecipes.filter(r => r.id !== recipeId)

  // Calculate similarity scores
  const similarityScores: RecipeSimilarityScore[] = otherRecipes.map(recipe => {
    const ingredientScore = calculateIngredientSimilarity(targetRecipe[0].ingredients, recipe.ingredients)
    const tagScore = calculateTagSimilarity(targetRecipe[0].tags, recipe.tags)
    const titleScore = calculateTitleSimilarity(targetRecipe[0].title, recipe.title)

    const totalScore = (
      ingredientScore * 0.6 +
      tagScore * 0.3 +
      titleScore * 0.1
    )

    return {
      recipeId: recipe.id,
      score: totalScore
    }
  })

  const topRecipeIds = similarityScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(score => score.recipeId)

  return getRecipes({ recipeIds: topRecipeIds })
} 