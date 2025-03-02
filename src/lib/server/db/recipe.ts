import { db } from '.'
import { recipe, recipeLike, recipeIngredient, ingredient } from './schema'
import { eq, ilike, or, desc, sql, inArray, and, count } from 'drizzle-orm'
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