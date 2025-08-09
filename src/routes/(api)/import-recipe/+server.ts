import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { importRecipeQueue } from '$lib/server/queue'
import { importRecipeLimiter, globalImportLimiter } from '$lib/server/rate-limit'
import { validateImportUrl } from '$lib/server/url-validation'
import { redis } from '$lib/server/redis'
import { dev } from '$app/environment'

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	const clientId = locals.user?.id ?? `anon:${getClientAddress?.() ?? 'unknown'}`
	const clientUsername = locals.user?.username ?? 'anonymous'

	const contentType = request.headers.get('content-type') || ''
	let body: any
	let inputType: string
	let url: string | undefined
	let text: string | undefined
	let imageBase64Array: string[] | undefined

	if (contentType.includes('multipart/form-data')) {
		const formData = await request.formData()
		inputType = formData.get('inputType') as string
		url = formData.get('url') as string
		text = formData.get('text') as string
		const imageFiles: File[] = []
		for (const [key, value] of formData.entries()) {
			if (key.startsWith('image') && value instanceof File && value.size > 0) {
				imageFiles.push(value)
			}
		}
		if (imageFiles.length > 0) {
			imageBase64Array = await Promise.all(
				imageFiles.map(async (file) => {
					const arrayBuffer = await file.arrayBuffer()
					const buffer = Buffer.from(arrayBuffer)
					return buffer.toString('base64')
				})
			)
		}
	} else {
		body = await request.json()
		url = body.url
		text = body.text
		inputType = body.inputType
	}

	if (!inputType || !['url', 'text', 'image'].includes(inputType)) {
		return json({ error: 'Invalid input type. Must be either "url", "text", or "image"' }, { status: 400 })
	}

	let urlValidation: any = null
	if (inputType === 'url') {
		if (!url || typeof url !== 'string') {
			return json({ error: 'Missing or invalid URL' }, { status: 400 })
		}
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
	} else if (inputType === 'image') {
		if (!imageBase64Array || imageBase64Array.length === 0) {
			return json({ error: 'Missing or invalid image files' }, { status: 400 })
		}
		if (imageBase64Array.length > 3) {
			return json({ error: 'Maximum 3 images allowed' }, { status: 400 })
		}
		const totalSizeInBytes = imageBase64Array.reduce((total, base64) => total + Math.ceil((base64.length * 3) / 4), 0)
		const maxSizeInBytes = 30 * 1024 * 1024
		if (totalSizeInBytes > maxSizeInBytes) {
			return json({ error: 'Total image file size must be less than 30MB' }, { status: 400 })
		}
	}

	let userLimit = { allowed: true, remaining: 999, resetTime: Date.now() / 1000 + 3600 }
	if (!dev) {
		userLimit = await importRecipeLimiter.checkLimit(clientId)
		if (!userLimit.allowed) {
			return json(
				{
					error: `Limit exceeded. You can import ${importRecipeLimiter.config.maxRequests} recipes per hour. Try again in ${Math.ceil((userLimit.resetTime - Date.now() / 1000) / 60)} minutes.`
				},
				{
					status: 429,
					headers: {
						'X-RateLimit-Remaining': userLimit.remaining.toString(),
						'X-RateLimit-Reset': userLimit.resetTime.toString()
					}
				}
			)
		}
	}

	let globalLimit = { allowed: true, remaining: 999, resetTime: Date.now() / 1000 + 3600 }
	if (!dev) {
		globalLimit = await globalImportLimiter.checkLimit('global')
		if (!globalLimit.allowed) {
			return json(
				{ error: 'Service temporarily unavailable due to high demand. Please try again later.' },
				{
					status: 503,
					headers: { 'Retry-After': Math.ceil((globalLimit.resetTime - Date.now() / 1000) / 60).toString() }
				}
			)
		}
	}

	let cacheKey: string | null = null
	let normalizedUrl: string | null = null
	if (inputType === 'url') {
		normalizedUrl = urlValidation.normalizedUrl!
		cacheKey = `imported-url:${clientId}:${normalizedUrl}`
		const alreadyQueued = await redis.get(cacheKey)
		if (alreadyQueued) {
			return json(
				{ error: 'This recipe is already being imported or was imported recently. Please wait a few minutes before trying again.' },
				{ status: 409 }
			)
		}
		await redis.set(cacheKey, 'in-progress', { ex: 900 })
	}

	const jobData: any = {
		userId: clientId,
		username: clientUsername,
		inputType
	}
	if (inputType === 'url') {
		jobData.url = normalizedUrl!
	} else if (inputType === 'text') {
		jobData.text = text!.trim()
	} else if (inputType === 'image') {
		jobData.imageBase64Array = imageBase64Array!
	}

	const job = await importRecipeQueue.add('import', jobData)

	return json(
		{ jobId: job.id, remaining: userLimit.remaining },
		{
			status: 202,
			headers: {
				'X-RateLimit-Remaining': userLimit.remaining.toString(),
				'X-RateLimit-Reset': userLimit.resetTime.toString()
			}
		}
	)
}
