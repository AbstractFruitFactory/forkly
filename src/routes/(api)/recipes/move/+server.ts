import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { moveRecipeSave, isRecipeSaved } from '$lib/server/db/save'
import * as v from 'valibot'

const moveSchema = v.object({
  id: v.string(),
  collectionName: v.optional(v.string())
})

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(moveSchema, data)

  const exists = await isRecipeSaved(input.id, locals.user.id)
  if (!exists) error(404, { message: 'Recipe not saved' })

  await moveRecipeSave(locals.user.id, input.id, input.collectionName)

  return json({ success: true })
}
