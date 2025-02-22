import { redirect, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { trpc } from '$lib/trpc/client'
import { uploadImage } from '$lib/server/cloudinary'

export const load: PageServerLoad = async (event) => {
  if (!event.locals.user) {
    throw redirect(302, '/login')
  }
  const recipes = await trpc(event).recipes.getUserRecipes.query()

  return {
    user: event.locals.user,
    recipes
  }
}

export const actions: Actions = {
  default: async (event) => {
    if (!event.locals.user) {
      throw redirect(302, '/login')
    }

    const formData = await event.request.formData()
    const username = formData.get('username')?.toString()
    const bio = formData.get('bio')?.toString()
    const avatar = formData.get('image') as File | undefined

    // Basic form validation
    if (!username) {
      return fail(400, { error: 'Username is required' })
    }

    if (username.length < 3) {
      return fail(400, { error: 'Username must be at least 3 characters long' })
    }

    let avatarUrl: string | null = null
    if (avatar?.size && avatar.size > 0) {
      const arrayBuffer = await avatar.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      avatarUrl = await uploadImage(buffer)
    }

    const updateData = {
      username,
      bio,
      ...(avatarUrl ? { avatarUrl } : {})
    }
    const result = await trpc(event).profile.update.mutate(updateData)

    if (!result.isOk()) {
      return fail(400, { error: result.error.message })
    }

    return { success: true }
  }
} 