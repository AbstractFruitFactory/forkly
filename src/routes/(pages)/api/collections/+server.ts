import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getCollections, createCollection } from '$lib/server/db/save'
import * as v from 'valibot'

const createCollectionSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1))
})

export type CollectionsResponse = {
  collections: Awaited<ReturnType<typeof getCollections>>
}

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized')

  const collections = await getCollections(locals.user.id)
  return json({ collections } satisfies CollectionsResponse)
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized')

  const data = await request.json()
  const validationResult = v.safeParse(createCollectionSchema, data)

  if (!validationResult.success) {
    throw error(400, { message: validationResult.issues.map(issue => issue.message).join(', ') })
  }

  const input = validationResult.output

  try {
    const newCollection = await createCollection(locals.user.id, input.name)
    return json(newCollection)
  } catch (err) {
    // Handle unique constraint violation
    if (err instanceof Error && err.message.includes('duplicate key')) {
      throw error(409, 'Collection with this name already exists')
    }
    throw error(500, 'Failed to create collection')
  }
}
