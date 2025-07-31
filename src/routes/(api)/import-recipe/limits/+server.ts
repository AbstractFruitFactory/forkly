import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { importRecipeLimiter } from '$lib/server/rate-limit'

export const GET: RequestHandler = async ({ locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 })
		}

		const limits = await importRecipeLimiter.getRemaining(locals.user.id)
		
		return json({
			remaining: limits.remaining,
			maxRequests: importRecipeLimiter.config.maxRequests,
			resetTime: limits.resetTime,
			windowMs: importRecipeLimiter.config.windowMs
		})
	} catch (err: any) {
		console.error('Rate limit check error:', err)
		return json({ error: err.message ?? 'Internal error' }, { status: 500 })
	}
} 