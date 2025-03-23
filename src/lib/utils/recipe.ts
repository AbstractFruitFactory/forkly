import type { DetailedRecipe } from "$lib/server/db/recipe"

export const toHomePageRecipe = (recipe: DetailedRecipe) => ({
  ...recipe,
  description: recipe.description || undefined,
  ingredients: recipe.ingredients.length,
  instructions: recipe.instructions.length,
  imageUrl: recipe.imageUrl,
  createdAt: typeof recipe.createdAt === 'string' ? recipe.createdAt : recipe.createdAt.toISOString(),
  user: recipe.user?.username
    ? {
      username: recipe.user.username,
      avatarUrl: recipe.user.avatarUrl
    }
    : undefined
})