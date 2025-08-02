import { json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { recipeDraft } from '$lib/server/db/schema'
import { eq, and } from 'drizzle-orm'

export const PATCH: RequestHandler = async ({ request, locals, params }) => {
  const userId = locals.user?.id
  console.log('hey')
  if (!userId) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const draftId = params.id
  if (!draftId) {
    return json({ success: false, error: 'Missing draft id' }, { status: 400 })
  }

  let data
  try {
    data = await request.json()
  } catch (e) {
    return json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const existing = await db.select().from(recipeDraft).where(and(eq(recipeDraft.id, draftId), eq(recipeDraft.userId, userId))).limit(1)
  if (!existing.length) {
    return json({ success: false, error: 'Draft not found or not owned by user' }, { status: 404 })
  }

  try {
    await db.update(recipeDraft)
      .set({
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        servings: data.servings,
        instructions: data.instructions,
        tags: data.tags
      })
      .where(and(eq(recipeDraft.id, draftId), eq(recipeDraft.userId, userId)))
    return json({ success: true })
  } catch (e) {
    console.error('Failed to update draft', e)
    return json({ success: false, error: 'Failed to update draft' }, { status: 500 })
  }
}

export const DELETE: RequestHandler = async ({ locals, params }) => {
  const userId = locals.user?.id
  if (!userId) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const draftId = params.id
  if (!draftId) {
    return json({ success: false, error: 'Missing draft id' }, { status: 400 })
  }

  const existing = await db.select().from(recipeDraft).where(and(eq(recipeDraft.id, draftId), eq(recipeDraft.userId, userId))).limit(1)
  if (!existing.length) {
    return json({ success: false, error: 'Draft not found or not owned by user' }, { status: 404 })
  }

  try {
    await db.delete(recipeDraft).where(and(eq(recipeDraft.id, draftId), eq(recipeDraft.userId, userId)))
    return json({ success: true })
  } catch (e) {
    console.error('Failed to delete draft', e)
    return json({ success: false, error: 'Failed to delete draft' }, { status: 500 })
  }
}
