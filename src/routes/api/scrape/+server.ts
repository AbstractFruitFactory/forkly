import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, fetch }) => {
	try {
		const body = await request.json()
		const { url } = body

		if (!url) {
			return json({ error: 'URL parameter is required' }, { status: 400 })
		}

		// Call the Python serverless function
		// In development, this will call the local Python server
		// In production, this will call the deployed Vercel function
		const pythonFunctionUrl = process.env.NODE_ENV === 'development' 
			? 'http://localhost:8000'
			: `${new URL(request.url).origin}/api/scrape`

		const response = await fetch(pythonFunctionUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ url })
		})

		if (!response.ok) {
			const errorData = await response.json()
			return json({ error: errorData.error || 'Failed to scrape recipe' }, { status: response.status })
		}

		const recipeData = await response.json()
		return json(recipeData)
	} catch (error) {
		console.error('Recipe scraping error:', error)
		return json({ error: 'Internal server error' }, { status: 500 })
	}
}

export const GET: RequestHandler = async () => {
	return json({
		message: 'Recipe Scraper API',
		usage: 'Send a POST request with JSON body containing "url" field',
		example: {
			url: 'https://www.allrecipes.com/recipe/24074/alysias-basic-meat-lasagna/'
		}
	})
} 