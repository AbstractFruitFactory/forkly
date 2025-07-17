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
		// In production, this will call the deployed Vercel function directly
		const pythonFunctionUrl = process.env.NODE_ENV === 'development' 
			? 'http://localhost:8000'
			: `${new URL(request.url).origin}/api/scrape/index.py`

		const response = await fetch(pythonFunctionUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ url })
		})

		if (!response.ok) {
			let errorMessage = 'Failed to scrape recipe'
			
			try {
				const errorData = await response.json()
				errorMessage = errorData.error || errorMessage
			} catch {
				// If we can't parse the error response, use a generic message based on status
				if (response.status === 400) {
					errorMessage = 'Invalid recipe URL or unsupported website'
				} else if (response.status === 404) {
					errorMessage = 'Recipe not found at the provided URL'
				} else if (response.status === 500) {
					errorMessage = 'Server error while scraping recipe'
				} else if (response.status >= 500) {
					errorMessage = 'Recipe scraper service is temporarily unavailable'
				}
			}
			
			return json({ error: errorMessage }, { status: response.status })
		}

		const recipeData = await response.json()
		
		// Additional validation on the frontend
		if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
			return json({ 
				error: 'The recipe data appears to be incomplete. Please try a different recipe URL.' 
			}, { status: 400 })
		}
		
		return json(recipeData)
	} catch (error) {
		console.error('Recipe scraping error:', error)
		
		// Provide more specific error messages based on the error type
		if (error instanceof TypeError && error.message.includes('fetch')) {
			return json({ 
				error: 'Unable to connect to the recipe scraper service. Please try again later.' 
			}, { status: 503 })
		}
		
		return json({ 
			error: 'An unexpected error occurred while processing your request' 
		}, { status: 500 })
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