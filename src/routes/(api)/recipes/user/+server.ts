import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getRecipes, type RecipeFilter, type DetailedRecipe } from '$lib/server/db/recipe'
import { getSavedRecipesByUser } from '$lib/server/db/save'
import map from 'ramda/src/map'

export type UserRecipes = {
  created: DetailedRecipe[]
  saved: (DetailedRecipe & { collectionName?: string })[]
  drafts: DetailedRecipe[]
}

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const createdFilters: RecipeFilter = {
    userId: locals.user.id,
    detailed: true,
    draft: false
  }

  const draftFilters: RecipeFilter = {
    userId: locals.user.id,
    detailed: true,
    draft: true
  }

  const [createdRecipes, draftRecipes] = await Promise.all([
    getRecipes(createdFilters),
    getRecipes(draftFilters)
  ])
  const savedRecipeIds = await getSavedRecipesByUser(locals.user.id)

  let savedRecipes: (DetailedRecipe & { collectionName?: string })[] = []

  if (savedRecipeIds.length > 0) {
    savedRecipes = await getRecipes({
      recipeIds: savedRecipeIds.map(r => r.recipeId),
      detailed: true
    }).then(map(r => ({
      ...r,
      collectionName: savedRecipeIds.find(s => s.recipeId === r.id)?.collectionName ?? undefined
    })))
  }

  return json({
    created: createdRecipes,
    saved: savedRecipes,
    drafts: draftRecipes
  } satisfies UserRecipes)
} 