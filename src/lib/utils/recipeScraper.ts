import { safeFetch } from '$lib/utils/fetch'

export interface RecipeData {
	title: string
	ingredients: string[]
	instructions: string[]
	yields: string
	total_time: string
	image: string
	host: string
	canonical_url: string
	language: string
	author: string
	ratings: number
	reviews_count: number
	nutrients: Record<string, any>
	difficulty: string
	prep_time: string
	cook_time: string
	description: string
	category: string
	cuisine: string
	tags: string[]
}

export interface ScrapeError {
	error: string
}

export async function scrapeRecipe(url: string): Promise<RecipeData | ScrapeError> {
	try {
		// In development, use the SvelteKit proxy
		// In production, call the Python function directly
		const apiUrl = import.meta.env.DEV 
			? '/api/scrape'
			: '/api/scrape/index.py'

		const result = await safeFetch<RecipeData>()(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ url })
		})

		if (result.isErr()) {
			// Provide more specific error messages based on the error type
			const errorMessage = result.error.message || 'Failed to scrape recipe'
			
			// Check for specific error patterns
			if (errorMessage.includes('Unable to access') || errorMessage.includes('not found')) {
				return { error: 'The recipe URL could not be accessed. Please check if the URL is correct and the website is available.' }
			} else if (errorMessage.includes('not supported')) {
				return { error: 'This recipe website is not currently supported. Please try a recipe from a supported website.' }
			} else if (errorMessage.includes('incomplete') || errorMessage.includes('could not be extracted')) {
				return { error: 'The recipe data could not be properly extracted. Please try a different recipe URL.' }
			} else if (errorMessage.includes('timeout') || errorMessage.includes('too long')) {
				return { error: 'The recipe website took too long to respond. Please try again.' }
			} else if (errorMessage.includes('connect') || errorMessage.includes('network')) {
				return { error: 'Unable to connect to the recipe scraper. Please check your internet connection and try again.' }
			}
			
			return { error: errorMessage }
		}

		return result.value
	} catch (error) {
		console.error('Recipe scraping error:', error)
		
		// Handle network/connection errors
		if (error instanceof TypeError && error.message.includes('fetch')) {
			return { error: 'Unable to connect to the recipe scraper. Please check your internet connection and try again.' }
		}
		
		// Handle other unexpected errors
		if (error instanceof Error) {
			return { error: error.message || 'An unexpected error occurred while scraping the recipe' }
		}
		
		return { error: 'An unexpected error occurred while scraping the recipe' }
	}
}

export function isValidRecipeUrl(url: string): boolean {
	try {
		const urlObj = new URL(url)
		const supportedHosts = [
			'allrecipes.com',
			'foodnetwork.com',
			'epicurious.com',
			'bonappetit.com',
			'seriouseats.com',
			'bbcgoodfood.com',
			'jamieoliver.com',
			'pioneerwoman.com',
			'tasteofhome.com',
			'bettycrocker.com',
			'kraftrecipes.com',
			'pillsbury.com'
		]
		
		return supportedHosts.some(host => urlObj.hostname.includes(host))
	} catch {
		return false
	}
} 