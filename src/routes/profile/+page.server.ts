import { fail, redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { trpc } from '$lib/trpc/client'

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

export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      throw redirect(302, '/login')
    }

    const data = await request.formData()
    const username = data.get('username')?.toString()
    const bio = data.get('bio')?.toString()

    if (!username) {
      throw fail(400, { error: 'Username is required' })
    }

    // Check if username is taken (if it's different from current username)
    if (username !== locals.user.username) {
      const [existingUser] = await db
        .select()
        .from(table.user)
        .where(eq(table.user.username, username))

      if (existingUser) {
        throw fail(400, { error: 'Username is already taken' })
      }
    }

    // Update user profile
    const user = await db
      .update(table.user)
      .set({ username, bio })
      .where(eq(table.user.id, locals.user.id))
      .returning()

    return { bio: user[0].bio }
  }
} satisfies Actions 