import { query, getRequestEvent } from '$app/server'
import { getRecipeWithDetails } from '$lib/server/db/recipe'
import * as v from 'valibot'
import { getCollections } from '$lib/server/db/save'
import { safeFetch } from '$lib/utils/fetch'
import type { CommentsResponse } from '../../../(api)/recipes/[id]/comments/+server'
import { error } from '@sveltejs/kit'

export const getRecipeData = query(
  v.object({
    id: v.string()
  }),
  async ({ id }: { id: string }) => {
    const { locals, fetch, isRemoteRequest } = getRequestEvent()

    const recipe = await getRecipeWithDetails(id, locals.user?.id)

    const comments = await safeFetch<CommentsResponse>(fetch)(`/recipes/${id}/comments?page=0`)

    if (comments.isErr()) {
      console.error('Failed to fetch comments:', comments.error)
      error(500, 'Failed to fetch comments')
    }

    const collections = locals.user
      ? (await getCollections(locals.user.id)).map((c) => c.name)
      : []

    return {
      recipe: recipe as NonNullable<typeof recipe>,
      comments: comments.value,
      collections,
      isLoggedIn: locals.user !== undefined,
      isRemoteRequest
    }
  }
)
