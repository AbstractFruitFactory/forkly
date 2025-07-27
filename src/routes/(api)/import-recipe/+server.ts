import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { importRecipeQueue } from '$lib/server/queue'

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url } = await request.json()
		if (!url || typeof url !== 'string') {
			return json({ error: 'Missing or invalid URL' }, { status: 400 })
		}

		const job = await importRecipeQueue.add('import', { url })
		return json({ jobId: job.id }, { status: 202 })
	} catch (err: any) {
		console.error('Import error:', err)
		return json({ error: err.message ?? 'Internal error' }, { status: 500 })
	}
}
