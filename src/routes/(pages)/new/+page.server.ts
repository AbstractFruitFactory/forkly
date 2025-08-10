import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { safeFetch } from '$lib/utils/fetch'
import { buildRecipePayloadFromForm, type RecipeApiResponse } from '$lib/server/utils/recipe-form'
import { deleteImage, deleteVideo } from '$lib/server/cloudinary'

async function cleanupUploadedMedia(formData: FormData) {
  const entries = Array.from(formData.entries())
  for (const [key, value] of entries) {
    if (key.endsWith('-url') && typeof value === 'string') {
      const base = key.slice(0, -4)
      const type = formData.get(`${base}-type`)?.toString()
      try {
        if (type === 'video') await deleteVideo(value)
        else await deleteImage(value)
      } catch (e) {
        console.error('Failed to cleanup media', value, e)
      }
    }
  }
}

export const actions = {
  createRecipe: async ({ request, fetch }) => {
    const formData = await request.formData()
    console.time('buildRecipePayloadFromForm')
    const { payload, error } = await buildRecipePayloadFromForm(formData)
    console.timeEnd('buildRecipePayloadFromForm')
    if (error) return error

    console.time('api:/recipes/create')
    const fetchResponse = await safeFetch<RecipeApiResponse>(fetch)(
      '/recipes/create',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    )
    console.timeEnd('api:/recipes/create')
    if (fetchResponse.isErr()) {
      console.error('Error creating recipe', fetchResponse.error)
      await cleanupUploadedMedia(formData)
      return fail(500, {
        success: false,
        errors: [{
          path: 'api',
          message: 'An unexpected error occurred while creating the recipe'
        }]
      })
    }

    if (formData.get('draft') === 'true') {
      const draftId = formData.get('id')?.toString()
      const deleteResponse = await safeFetch(fetch)(`/recipes/draft/${draftId}`, {
        method: 'DELETE'
      })
      if (deleteResponse.isErr()) {
        console.error('Failed to delete draft', deleteResponse.error)
      }
    }

    return { success: true, recipeId: fetchResponse.value.id }
  },
  saveDraft: async ({ request, fetch, locals }) => {
    const { user } = locals
    if (!user) {
      return fail(401, {
        success: false,
        errors: [{ path: 'user', message: 'Unauthorized' }]
      })
    }
    const formData = await request.formData()
    const draftId = formData.get('id')?.toString()
    const { payload, error } = await buildRecipePayloadFromForm(formData, true)
    if (error) {
      console.error(error?.data.errors)
      return error
    }

    let fetchResponse = await safeFetch<RecipeApiResponse>(fetch)(
      draftId ? `/recipes/draft/${draftId}` : '/recipes/draft',
      {
        method: draftId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    )

    if (fetchResponse.isErr()) {
      console.error('Error saving draft', fetchResponse.error)
      await cleanupUploadedMedia(formData)
      return fail(500, {
        success: false,
        errors: [{
          path: 'api',
          message: 'An unexpected error occurred while saving the draft'
        }]
      })
    }

    redirect(302, `/user/${user.username}?tab=Drafts`)
  }
} satisfies Actions