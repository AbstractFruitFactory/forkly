import { json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { recipeDraft, recipe, recipeInstruction } from '$lib/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { deleteImage, deleteVideo } from '$lib/server/cloudinary'

async function isUrlReferenced(url: string): Promise<boolean> {
  const recipeRef = await db.select().from(recipe).where(eq(recipe.imageUrl, url)).limit(1)
  if (recipeRef.length) return true
  const instrRef = await db.select().from(recipeInstruction).where(eq(recipeInstruction.mediaUrl, url)).limit(1)
  return instrRef.length > 0
}

export const PATCH: RequestHandler = async ({ request, locals, params }) => {
  const userId = locals.user?.id
  if (!userId) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const draftId = params.id
  if (!draftId) {
    return json({ success: false, error: 'Missing draft id' }, { status: 400 })
  }

  let data: any
  try {
    data = await request.json()
  } catch (e) {
    return json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const existing = await db.select().from(recipeDraft).where(and(eq(recipeDraft.id, draftId), eq(recipeDraft.userId, userId))).limit(1)
  if (!existing.length) {
    return json({ success: false, error: 'Draft not found or not owned by user' }, { status: 404 })
  }

  const oldDraft = existing[0] as any
  const oldUrls = new Set<string>()
  if (oldDraft.imageUrl) oldUrls.add(oldDraft.imageUrl)
  const oldInstructions: any[] = Array.isArray(oldDraft.instructions) ? oldDraft.instructions : []
  for (const ins of oldInstructions) {
    if (ins?.mediaUrl) oldUrls.add(ins.mediaUrl)
  }

  const newUrls = new Set<string>()
  if (data.imageUrl) newUrls.add(data.imageUrl)
  const newInstructions: any[] = Array.isArray(data.instructions) ? data.instructions : []
  for (const ins of newInstructions) {
    if (ins?.mediaUrl) newUrls.add(ins.mediaUrl)
  }

  const toDelete = [...oldUrls].filter((u) => !newUrls.has(u))

  for (const url of toDelete) {
    try {
      const referenced = await isUrlReferenced(url)
      if (referenced) continue
      const ins = oldInstructions.find((i) => i?.mediaUrl === url)
      const type = ins?.mediaType === 'video' ? 'video' : 'image'
      if (type === 'video') await deleteVideo(url)
      else await deleteImage(url)
    } catch (e) {
      console.error('Failed to delete draft media from Cloudinary', url, e)
    }
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

  const draft = existing[0] as any
  const urls: { url: string; type: 'image' | 'video' }[] = []
  if (draft.imageUrl) urls.push({ url: draft.imageUrl, type: 'image' })
  const instructions: any[] = Array.isArray(draft.instructions) ? draft.instructions : []
  for (const ins of instructions) {
    if (ins?.mediaUrl) urls.push({ url: ins.mediaUrl, type: ins.mediaType === 'video' ? 'video' : 'image' })
  }

  for (const item of urls) {
    try {
      const referenced = await isUrlReferenced(item.url)
      if (referenced) continue
      if (item.type === 'video') await deleteVideo(item.url)
      else await deleteImage(item.url)
    } catch (e) {
      console.error('Failed to delete draft media from Cloudinary', item.url, e)
    }
  }

  try {
    await db.delete(recipeDraft).where(and(eq(recipeDraft.id, draftId), eq(recipeDraft.userId, userId)))
    return json({ success: true })
  } catch (e) {
    console.error('Failed to delete draft', e)
    return json({ success: false, error: 'Failed to delete draft' }, { status: 500 })
  }
}
