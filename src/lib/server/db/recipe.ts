import { db } from '.'
import { recipe, recipeLike, recipeInstruction, recipeIngredient, ingredient, recipeNutrition, user, recipeBookmark, recipeTag, tag, recipeDraft } from './schema'
import { eq, ilike, desc, sql, and, SQL, or, asc } from 'drizzle-orm'
import { nullToUndefined } from '$lib/utils/nullToUndefined'
import { generateId } from '$lib/server/id'
import { parseQuantityToNumber } from '$lib/utils/unitConversion'

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
  instructions: Array<{
    id: string
    text: string
    mediaUrl?: string
    mediaType?: 'image' | 'video'
    ingredients?: Array<{
      id: string
      name: string
      quantity: { text: string, numeric?: number }
      measurement: string
      displayName: string
    }>
  }>
  tags: string[]
  imageUrl?: string
  createdAt: Date
  likes: number
  bookmarks: number
  servings: number
  ingredients: Array<{
    id: string
    name: string
    quantity: { text: string, numeric?: number }
    measurement: string
    custom?: boolean
    displayName: string
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
  },
  isLiked: boolean
  isSaved: boolean
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
  sort?: 'popular' | 'newest' | 'easiest'
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
    detailed = false,
    sort
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
      const tagCondition = sql`EXISTS (SELECT 1 FROM recipe_tag WHERE recipe_tag.recipe_id = ${recipe.id} AND recipe_tag.tag_name ILIKE ${'%' + term + '%'})`
      const ingredientCondition = sql`EXISTS (
        SELECT 1 FROM recipe_ingredient rii
        JOIN ingredient i ON rii.ingredient_id = i.id
        WHERE rii.recipe_id = ${recipe.id} AND i.name ILIKE ${'%' + term + '%'}
      )`

      const validConditions = [titleCondition, tagCondition, ingredientCondition].filter(Boolean)

      if (validConditions.length > 0) {
        conditions.push(or(...validConditions) as any)
      }
    }
  }

  // Tags filters
  if (tags.length > 0) {
    for (const tagName of tags) {
      conditions.push(sql`EXISTS (SELECT 1 FROM recipe_tag WHERE recipe_tag.recipe_id = ${recipe.id} AND recipe_tag.tag_name = ${tagName})`)
    }
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
      SELECT rii.recipe_id 
      FROM recipe_ingredient rii
      JOIN ingredient i ON rii.ingredient_id = i.id
      WHERE i.name IN (${sql.raw(ingredientsList)})
      GROUP BY rii.recipe_id
      HAVING COUNT(DISTINCT i.name) = ${ingredients.length}
    )`)
  }

  // Excluded ingredient filtering using raw SQL subquery
  if (excludedIngredients.length > 0) {
    const excludedList = excludedIngredients.map(ing => `'${escapeSqlString(ing)}'`).join(',')
    conditions.push(sql`${recipe.id} NOT IN (
      SELECT rii.recipe_id 
      FROM recipe_ingredient rii
      JOIN ingredient i ON rii.ingredient_id = i.id
      WHERE i.name IN (${sql.raw(excludedList)})
      GROUP BY rii.recipe_id
    )`)
  }

  // Create the final where condition
  const whereCondition = conditions.length === 0
    ? undefined
    : (conditions.length === 1 ? conditions[0] : and(...conditions))

  // Helper function to determine ordering based on sort parameter
  const getOrderBy = () => {
    switch (sort) {
      case 'newest':
        return [desc(recipe.createdAt), desc(recipe.id)]
      case 'easiest':
        // For easiest, we'll order by fewer ingredients and instructions
        // We need to count ingredients and instructions in a subquery
        return [
          asc(sql`(
            SELECT COUNT(*) 
            FROM recipe_ingredient rii 
            WHERE rii.recipe_id = ${recipe.id}
          )`),
          asc(sql`(
            SELECT COUNT(*) 
            FROM recipe_instruction ri 
            WHERE ri.recipe_id = ${recipe.id}
          )`),
          desc(recipe.createdAt)
        ]
      case 'popular':
      default:
        // For popular, we'll order by likes count, then by recency
        return [desc(sql`count(DISTINCT ${recipeLike.userId})`), desc(recipe.createdAt), desc(recipe.id)]
    }
  }

  if (detailed) {
    // Build detailed query
    const detailedRecipeQuery = db
      .select({
        id: recipe.id,
        userId: recipe.userId,
        title: recipe.title,
        description: recipe.description,
        tags: sql<string[]>`coalesce(array_agg(distinct ${recipeTag.tagName}) filter (where ${recipeTag.tagName} is not null), '{}')`,
        imageUrl: recipe.imageUrl,
        createdAt: recipe.createdAt,
        servings: recipe.servings,
        likes: sql<number>`count(DISTINCT ${recipeLike.userId})::int`,
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
      .leftJoin(recipeTag, eq(recipe.id, recipeTag.recipeId))

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
      .orderBy(...getOrderBy())
      .offset(page * limit)

    // Apply limit if provided
    const limitedQuery = limit ? finalQuery.limit(limit) : finalQuery

    const results = await limitedQuery
    const transformed = nullToUndefined(results)

    // For detailed queries, we need to fetch instructions separately
    const recipesWithInstructions = await Promise.all(
      transformed.map(async (r) => {
        const instructions = await db
          .select({
            id: recipeInstruction.id,
            text: recipeInstruction.text,
            mediaUrl: recipeInstruction.mediaUrl,
            mediaType: recipeInstruction.mediaType,
            order: recipeInstruction.order
          })
          .from(recipeInstruction)
          .where(eq(recipeInstruction.recipeId, r.id))
          .orderBy(asc(recipeInstruction.order))

        // Get ingredients for each instruction
        const instructionIngredients = await db
          .select({
            instructionId: recipeIngredient.instructionId,
            ingredient: ingredient,
            quantity: recipeIngredient.quantity,
            numericQuantity: recipeIngredient.numericQuantity,
            measurement: recipeIngredient.measurement,
            displayName: recipeIngredient.displayName
          })
          .from(recipeIngredient)
          .innerJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
          .where(eq(recipeIngredient.recipeId, r.id))

        // Group ingredients by instruction
        const ingredientsByInstruction = new Map<string, Array<{
          id: string
          name: string
          quantity: { text: string, numeric?: number }
          measurement: string
          displayName: string
        }>>()

        for (const { ingredient: ingr, quantity, numericQuantity, measurement, displayName, instructionId } of instructionIngredients) {
          if (!ingredientsByInstruction.has(instructionId)) {
            ingredientsByInstruction.set(instructionId, [])
          }
          ingredientsByInstruction.get(instructionId)!.push({
            id: ingr.id,
            name: ingr.name,
            quantity: { text: quantity, numeric: numericQuantity ?? undefined },
            measurement: measurement || '',
            displayName: displayName
          })
        }

        // Aggregate ingredients for the main ingredients list
        const ingredientMap = new Map<string, {
          id: string
          name: string
          quantity: { text?: string, numeric?: number }
          measurement: string
          displayName: string
        }>()

        for (const { ingredient: ingr, quantity, numericQuantity, measurement, displayName } of instructionIngredients) {
          const key = `${ingr.id}-${measurement}-${displayName}`
          if (ingredientMap.has(key)) {
            const addQty = typeof numericQuantity === 'number' ? numericQuantity : 0
            const prevQty = ingredientMap.get(key)!.quantity?.numeric ?? 0
            ingredientMap.get(key)!.quantity = { numeric: prevQty + addQty }
          } else {
            ingredientMap.set(key, {
              id: ingr.id,
              name: ingr.name,
              quantity: { text: quantity ?? undefined, numeric: numericQuantity ?? undefined },
              measurement: measurement || '',
              displayName: displayName
            })
          }
        }

        // Add ingredients to instructions
        const instructionsWithIngredients = instructions.map(instruction => ({
          ...instruction,
          ingredients: ingredientsByInstruction.get(instruction.id) || []
        }))

        if (
          (r as any).nutrition &&
          Object.values((r as any).nutrition as Record<string, unknown>).every(v => v === undefined)
        ) {
          (r as any).nutrition = undefined
        }

        return {
          ...r,
          instructions: instructionsWithIngredients,
          ingredients: Array.from(ingredientMap.values())
        }
      })
    )

    return recipesWithInstructions
  } else {
    // Basic query with limited fields
    const basicRecipeQuery = db
      .select({
        id: recipe.id,
        title: recipe.title,
        imageUrl: recipe.imageUrl,
        tags: sql<string[]>`coalesce(array_agg(distinct ${recipeTag.tagName}) filter (where ${recipeTag.tagName} is not null), '{}')`,
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
      .orderBy(...getOrderBy())
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
 * Update a recipe
 * @param recipeId The recipe ID
 * @param userId The user ID (for authorization)
 * @param input The updated recipe data
 * @returns Whether the recipe was updated
 */
export async function updateRecipe(recipeId: string, userId: string, input: {
  title: string
  description?: string
  servings: number
  instructions: Array<{
    id: string
    text: string
    mediaUrl?: string
    mediaType?: 'image' | 'video'
    ingredients?: Array<{
      name: string
      quantity?: string
      measurement?: string
      displayName: string
    }>
  }>
  nutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  } | null
  tags: string[]
  imageUrl?: string
}) {
  const recipeToUpdate = await db
    .select()
    .from(recipe)
    .where(and(
      eq(recipe.id, recipeId),
      eq(recipe.userId, userId)
    ))
    .limit(1)

  if (!recipeToUpdate.length) {
    return false
  }

  // Update the main recipe
  await db.update(recipe)
    .set({
      title: input.title,
      description: input.description,
      servings: input.servings,
      imageUrl: input.imageUrl
    })
    .where(eq(recipe.id, recipeId))

  // Update nutrition
  if (input.nutrition) {
    await db.insert(recipeNutrition)
      .values({
        recipeId: recipeId,
        calories: input.nutrition.calories,
        protein: input.nutrition.protein,
        carbs: input.nutrition.carbs,
        fat: input.nutrition.fat
      })
      .onConflictDoUpdate({
        target: recipeNutrition.recipeId,
        set: {
          calories: input.nutrition.calories,
          protein: input.nutrition.protein,
          carbs: input.nutrition.carbs,
          fat: input.nutrition.fat
        }
      })
  } else {
    await db.delete(recipeNutrition).where(eq(recipeNutrition.recipeId, recipeId))
  }

  // Delete existing instructions and ingredients
  await db.delete(recipeIngredient).where(eq(recipeIngredient.recipeId, recipeId))
  await db.delete(recipeInstruction).where(eq(recipeInstruction.recipeId, recipeId))

  // Insert new instructions and their ingredients
  for (let i = 0; i < input.instructions.length; i++) {
    const instruction = input.instructions[i]

    // Insert the instruction
    await db.insert(recipeInstruction).values({
      id: instruction.id,
      recipeId: recipeId,
      text: instruction.text,
      mediaUrl: instruction.mediaUrl,
      mediaType: instruction.mediaType,
      order: i + 1
    })

    // Insert ingredients for this instruction
    if (instruction.ingredients) {
      for (const ingredientData of instruction.ingredients) {
        let ingredientId: string

        const existingIngredient = await db
          .select()
          .from(ingredient)
          .where(eq(ingredient.name, ingredientData.name))
          .limit(1)

        if (existingIngredient.length) {
          ingredientId = existingIngredient[0].id
        } else {
          const newIngredient = await db.insert(ingredient).values({
            id: generateId(),
            name: ingredientData.name
          }).returning()
          ingredientId = newIngredient[0].id
        }

        await db.insert(recipeIngredient).values({
          recipeId: recipeId,
          instructionId: instruction.id,
          ingredientId: ingredientId,
          displayName: ingredientData.displayName,
          quantity: ingredientData.quantity ?? undefined,
          numericQuantity: parseQuantityToNumber(ingredientData.quantity) ?? undefined,
          measurement: ingredientData.measurement ?? null
        })
      }
    }
  }

  // Update tags
  await db.delete(recipeTag).where(eq(recipeTag.recipeId, recipeId))

  for (const tagName of input.tags) {
    const existingTag = await db
      .select({ name: tag.name })
      .from(tag)
      .where(eq(tag.name, tagName))
      .limit(1)

    if (!existingTag.length) {
      await db.insert(tag).values({ name: tagName })
    }

    await db.insert(recipeTag).values({ recipeId, tagName })
  }

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
    imageUrl: recipe.imageUrl,
    servings: recipe.servings,
    createdAt: recipe.createdAt,
    userId: recipe.userId,
    user: {
      username: user.username,
      avatarUrl: user.avatarUrl
    }
  })
    .from(recipe)
    .leftJoin(user, eq(recipe.userId, user.id))
    .where(eq(recipe.id, recipeId))

  const foundRecipe = recipes[0]
  if (!foundRecipe) return null

  // Fetch tags for the recipe
  const tagRows = await db.select({ tagName: recipeTag.tagName })
    .from(recipeTag)
    .where(eq(recipeTag.recipeId, recipeId))
  const tags = tagRows.map(row => row.tagName)

  // Get instructions
  const instructions = await db
    .select({
      id: recipeInstruction.id,
      text: recipeInstruction.text,
      mediaUrl: recipeInstruction.mediaUrl,
      mediaType: recipeInstruction.mediaType,
      order: recipeInstruction.order
    })
    .from(recipeInstruction)
    .where(eq(recipeInstruction.recipeId, recipeId))
    .orderBy(asc(recipeInstruction.order))

  // Get ingredients per instruction
  const instructionIngredients = await db
    .select({
      instructionId: recipeIngredient.instructionId,
      ingredient: ingredient,
      quantity: recipeIngredient.quantity,
      numericQuantity: recipeIngredient.numericQuantity,
      measurement: recipeIngredient.measurement,
      displayName: recipeIngredient.displayName
    })
    .from(recipeIngredient)
    .innerJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
    .where(eq(recipeIngredient.recipeId, recipeId))

  // Group ingredients by instruction
  const ingredientsByInstruction = new Map<string, Array<{
    id: string
    name: string
    quantity: { text?: string, numeric?: number }
    measurement: string
    displayName: string
  }>>()

  for (const { ingredient: ingr, quantity, numericQuantity, measurement, displayName, instructionId } of instructionIngredients) {
    if (!ingredientsByInstruction.has(instructionId)) {
      ingredientsByInstruction.set(instructionId, [])
    }
    ingredientsByInstruction.get(instructionId)!.push({
      id: ingr.id,
      name: ingr.name,
      quantity: { text: quantity ?? undefined, numeric: numericQuantity ?? undefined },
      measurement: measurement || '',
      displayName: displayName
    })
  }

  // Aggregate ingredients for the main ingredients list
  const ingredientMap = new Map<string, {
    id: string
    name: string
    quantity: { text?: string, numeric?: number }
    measurement: string
    displayName: string
  }>()

  for (const { ingredient: ingr, quantity, numericQuantity, measurement, displayName } of instructionIngredients) {
    const key = `${ingr.id}-${measurement}-${displayName}`
    if (ingredientMap.has(key)) {
      const addQty = typeof numericQuantity === 'number' ? numericQuantity : 0
      const prevQty = ingredientMap.get(key)!.quantity?.numeric ?? 0
      ingredientMap.get(key)!.quantity = { numeric: prevQty + addQty }
    } else {
      ingredientMap.set(key, {
        id: ingr.id,
        name: ingr.name,
        quantity: { text: quantity ?? undefined, numeric: numericQuantity ?? undefined },
        measurement: measurement || '',
        displayName: displayName
      })
    }
  }

  const nutritionData = await db
    .select()
    .from(recipeNutrition)
    .where(eq(recipeNutrition.recipeId, recipeId))

  const nutrition = nutritionData[0] ?? null

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

  // Add ingredients to instructions
  const instructionsWithIngredients = instructions.map(instruction => ({
    ...instruction,
    ingredients: ingredientsByInstruction.get(instruction.id) || []
  }))

  const result = {
    ...foundRecipe,
    instructions: instructionsWithIngredients,
    ingredients: Array.from(ingredientMap.values()),
    nutrition: nutrition ? {
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    } : undefined,
    isLiked,
    isSaved,
    likes: likes.length,
    user: foundRecipe.user,
    tags: tags
  }
  const transformed = nullToUndefined(result)
  if (
    transformed.nutrition &&
    Object.values(transformed.nutrition as Record<string, unknown>).every(v => v === undefined)
  ) {
    transformed.nutrition = undefined
  }

  return transformed
}

export type RecipeSimilarityScore = {
  recipeId: string
  score: number
}

const calculateIngredientSimilarity = (ingredients1: DetailedRecipe['ingredients'], ingredients2: DetailedRecipe['ingredients']): number => {
  if (!ingredients1?.length || !ingredients2?.length) return 0

  const normalized1 = ingredients1.map(i => ({
    name: i.name.toLowerCase(),
    quantity: i.quantity?.numeric ?? 0
  }))
  const normalized2 = ingredients2.map(i => ({
    name: i.name.toLowerCase(),
    quantity: i.quantity?.numeric ?? 0
  }))

  let totalSimilarity = 0
  let totalIngredients = Math.max(normalized1.length, normalized2.length)

  for (const ing1 of normalized1) {
    const matchingIng = normalized2.find(ing2 => ing2.name === ing1.name)
    if (matchingIng) {
      const q1 = typeof ing1.quantity === 'number' ? ing1.quantity : 0
      const q2 = typeof matchingIng.quantity === 'number' ? matchingIng.quantity : 0
      const quantityDiff = Math.abs(q1 - q2)
      const maxQuantity = Math.max(q1, q2)
      const quantitySimilarity = maxQuantity === 0 ? 1 : 1 - (quantityDiff / maxQuantity)
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

export async function getRecipeDraftsByUser(userId: string) {
  return db.select().from(recipeDraft).where(eq(recipeDraft.userId, userId))
} 