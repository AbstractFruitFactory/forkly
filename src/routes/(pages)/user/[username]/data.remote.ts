import { error } from '@sveltejs/kit'
import { query, getRequestEvent } from '$app/server'
import { getUserByUsername, getPublicUserByUsername, type User } from '$lib/server/db/user'
import * as v from 'valibot'
import { safeFetch } from '$lib/utils/fetch'
import type { UserRecipes } from '../../../(api)/recipes/user/+server'
import { getCollections } from '$lib/server/db/save'
import { getRecipes, type DetailedRecipe, getRecipeDraftsByUser } from '$lib/server/db/recipe'
import type { RecipeDraft } from '$lib/server/db/schema'

export const getUserProfile = query(
  v.object({
    username: v.string(),
    tab: v.optional(v.string())
  }),
  async ({ username, tab }: { username: string; tab?: string }) => {
    const { locals, fetch } = getRequestEvent()

    const isOwner = locals.user && locals.user.username === username || false

    let profileUser: User

    if (isOwner) {
      profileUser = await getUserByUsername(username)
    } else {
      profileUser = await getPublicUserByUsername(username)
    }

    if (!profileUser) error(404, 'User not found')

    let recipes: DetailedRecipe[]
    let collections: { name: string; count: number }[]
    let drafts: RecipeDraft[] = []

    if (isOwner) {
      const userRecipes = await safeFetch<UserRecipes>(fetch)('/recipes/user')
      if (userRecipes.isErr()) error(500, 'Failed to load recipes')
      recipes = userRecipes.value.created
      collections = await getCollections(locals.user!.id)
      const rawDrafts = await getRecipeDraftsByUser(locals.user!.id)
      drafts = rawDrafts.map(draft => ({
        ...draft,
        instructions: typeof draft.instructions === 'string' ? JSON.parse(draft.instructions) : draft.instructions,
        tags: typeof draft.tags === 'string' ? JSON.parse(draft.tags) : draft.tags
      }))
    } else {
      recipes = await getRecipes({
        userId: profileUser.id,
        detailed: true
      })
      collections = []
    }

    return {
      isOwner,
      profileUser,
      currentUser: locals.user,
      recipes,
      collections,
      drafts,
      initialTab: tab ?? undefined
    }
  }
)
