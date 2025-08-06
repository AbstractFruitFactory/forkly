import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { importRecipeLimiter } from '$lib/server/rate-limit'
import { dev } from '$app/environment'

export const GET: RequestHandler = async ({ locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 })
		}

		// In development, return unlimited rate limits
		if (dev) {
			return json({
				remaining: 999,
				maxRequests: 999,
				resetTime: Math.ceil((Date.now() / 1000) + 3600),
				windowMs: importRecipeLimiter.config.windowMs,
				development: true
			})
		}

		const limits = await importRecipeLimiter.getRemaining(locals.user.id)
		
		return json({
			remaining: limits.remaining,
			maxRequests: importRecipeLimiter.config.maxRequests,
			resetTime: limits.resetTime,
			windowMs: importRecipeLimiter.config.windowMs,
			development: false
		})
	} catch (err: any) {
		console.error('Rate limit check error:', err)
		return json({ error: err.message ?? 'Internal error' }, { status: 500 })
	}
} 