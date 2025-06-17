import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { renameCollection } from '$lib/server/db/save'
import * as v from 'valibot'

const renameSchema = v.object({
	oldName: v.string(),
	newName: v.string()
})

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, { message: 'Unauthorized' })

	const data = await request.json()
	const input = v.parse(renameSchema, data)

	try {
		await renameCollection(locals.user.id, input.oldName, input.newName)
		return json({ success: true })
	} catch (err) {
		throw error(500, 'Failed to rename collection')
	}
}
