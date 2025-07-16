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
		const result = await safeFetch<RecipeData>()('/api/scrape', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ url })
		})

		if (result.isErr()) {
			return { error: result.error.message || 'Failed to scrape recipe' }
		}

		return result.value
	} catch (error) {
		console.error('Recipe scraping error:', error)
		return { error: 'Failed to connect to recipe scraper' }
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