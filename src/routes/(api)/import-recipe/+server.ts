import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { importRecipeQueue } from '$lib/server/queue'
import { spawnImportWorker } from '../../../../scripts/spawn-worker'
import { importRecipeLimiter, globalImportLimiter } from '$lib/server/rate-limit'
import { validateImportUrl } from '$lib/server/url-validation'
import { redis } from '$lib/server/redis'

export const POST: RequestHandler = async ({ request, locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ error: 'Authentication required' }, { status: 401 })
	}

	const body = await request.json()
	const { url, text, inputType } = body

	// Validate input type
	if (!inputType || !['url', 'text'].includes(inputType)) {
		return json({ error: 'Invalid input type. Must be either "url" or "text"' }, { status: 400 })
	}

	// Validate input based on type
	let urlValidation: any = null
	if (inputType === 'url') {
		if (!url || typeof url !== 'string') {
			return json({ error: 'Missing or invalid URL' }, { status: 400 })
		}

		// Validate URL format and security
		urlValidation = validateImportUrl(url)
		if (!urlValidation.isValid) {
			return json({ error: urlValidation.error }, { status: 400 })
		}
	} else if (inputType === 'text') {
		if (!text || typeof text !== 'string') {
			return json({ error: 'Missing or invalid text content' }, { status: 400 })
		}

		if (text.trim().length < 50) {
			return json({ error: 'Text content must be at least 50 characters long' }, { status: 400 })
		}

		if (text.length > 10000) {
			return json({ error: 'Text content must be less than 10,000 characters' }, { status: 400 })
		}
	}

	// Rate limiting per user
	const userLimit = await importRecipeLimiter.checkLimit(locals.user.id)
	if (!userLimit.allowed) {
		return json({
			error: `Limit exceeded. You can import ${importRecipeLimiter.config.maxRequests} recipes per hour. Try again in ${Math.ceil((userLimit.resetTime - Date.now() / 1000) / 60)} minutes.`
		}, {
			status: 429,
			headers: {
				'X-RateLimit-Remaining': userLimit.remaining.toString(),
				'X-RateLimit-Reset': userLimit.resetTime.toString()
			}
		})
	}

	// Global rate limiting
	const globalLimit = await globalImportLimiter.checkLimit('global')
	if (!globalLimit.allowed) {
		return json({
			error: 'Service temporarily unavailable due to high demand. Please try again later.'
		}, {
			status: 503,
			headers: {
				'Retry-After': Math.ceil((globalLimit.resetTime - Date.now() / 1000) / 60).toString()
			}
		})
	}

	// Check for duplicate requests (only for URL imports)
	let cacheKey: string | null = null
	let normalizedUrl: string | null = null

	if (inputType === 'url') {
		normalizedUrl = urlValidation.normalizedUrl!
		cacheKey = `imported-url:${locals.user.id}:${normalizedUrl}`
		const alreadyQueued = await redis.get(cacheKey)

		if (alreadyQueued) {
			return json({
				error: 'This recipe is already being imported or was imported recently. Please wait a few minutes before trying again.'
			}, { status: 409 })
		}

		// Mark it as in-progress (TTL = 15 min)
		await redis.set(cacheKey, 'in-progress', { ex: 900 })
	}

	// Add job to queue with user context
	const jobData: any = {
		userId: locals.user.id,
		username: locals.user.username,
		inputType
	}

	if (inputType === 'url') {
		jobData.url = normalizedUrl!
	} else {
		jobData.text = text.trim()
	}

	const job = await importRecipeQueue.add('import', jobData)

	// Spawn worker on demand
	spawnImportWorker().catch(err => {
		console.error('Failed to spawn worker:', err)
	})

	return json({
		jobId: job.id,
		remaining: userLimit.remaining
	}, {
		status: 202,
		headers: {
			'X-RateLimit-Remaining': userLimit.remaining.toString(),
			'X-RateLimit-Reset': userLimit.resetTime.toString()
		}
	})
}
