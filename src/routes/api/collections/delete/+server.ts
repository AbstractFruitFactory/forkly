import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { deleteCollection } from '$lib/server/db/save'
import * as v from 'valibot'

const deleteSchema = v.object({
	name: v.string()
})

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, { message: 'Unauthorized' })

	const data = await request.json()
	const input = v.parse(deleteSchema, data)

	try {
		const success = await deleteCollection(locals.user.id, input.name)
		if (!success) error(404, { message: 'Collection not found' })
		return json({ success: true })
	} catch (err) {
		throw error(500, 'Failed to delete collection')
	}
}
