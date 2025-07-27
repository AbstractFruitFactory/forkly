import { json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { recipeDraft } from '$lib/server/db/schema'
import { generateId } from '$lib/server/id'

export const POST: RequestHandler = async ({ request, locals }) => {
  const userId = locals.user?.id
  if (!userId) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let data
  try {
    data = await request.json()
  } catch (e) {
    return json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const draftId = generateId()
  try {
    await db.insert(recipeDraft).values({
      id: draftId,
      userId,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      servings: data.servings,
      instructions: data.instructions,
      createdAt: new Date()
    })
    return json({ success: true, id: draftId })
  } catch (e) {
    return json({ success: false, error: 'Failed to save draft' }, { status: 500 })
  }
} 