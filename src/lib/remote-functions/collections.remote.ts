import { command, getRequestEvent, query } from '$app/server'
import * as v from 'valibot'
import { error } from '@sveltejs/kit'
import { createCollection as createCollectionDb, getCollections as getCollectionsDb } from '$lib/server/db/save'

export const createCollection = command(
	v.object({ name: v.pipe(v.string(), v.minLength(1)) }),
	async ({ name }) => {
		const { locals } = getRequestEvent()
		if (!locals.user) error(401, { message: 'Unauthorized' })

		try {
			const created = await createCollectionDb(locals.user.id, name)
			return created
		} catch (err) {
			if (err instanceof Error && err.message.includes('duplicate key')) {
				error(409, { message: 'Collection with this name already exists' })
			}
			error(500, { message: 'Failed to create collection' })
		}

	}
)

export const getCollections = query(async () => {
	const { locals } = getRequestEvent()
	if (!locals.user) error(401, { message: 'Unauthorized' })
	return await getCollectionsDb(locals.user.id)
}) 