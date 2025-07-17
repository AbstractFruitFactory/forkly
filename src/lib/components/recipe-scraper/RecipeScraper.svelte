<script lang="ts">
	import { scrapeRecipe, type RecipeData } from '$lib/utils/recipeScraper'
	import Button from '$lib/components/button/Button.svelte'
	import Input from '$lib/components/input/Input.svelte'
	import WarningBox from '$lib/components/warning-box/WarningBox.svelte'

	let {
		onClose,
		onRecipeScraped
	}: {
		onClose?: () => void
		onRecipeScraped?: (recipe: RecipeData) => void
	} = $props()

	let url = $state('')
	let isLoading = $state(false)
	let error: string | null = $state(null)

	function isValidUrl(urlString: string): boolean {
		try {
			new URL(urlString)
			return true
		} catch {
			return false
		}
	}

	async function handleScrape() {
		if (!url.trim()) {
			error = 'Please enter a recipe URL'
			return
		}
		
		if (!isValidUrl(url)) {
			error = 'Please enter a valid URL'
			return
		}

		isLoading = true
		error = null

		try {
			const result = await scrapeRecipe(url)

			if ('error' in result) {
				error = result.error
			} else {
				// Additional validation on the frontend
				if (!result.title || !result.ingredients || !result.instructions) {
					error = 'The recipe data appears to be incomplete. Please try a different recipe URL.'
					return
				}
				
				onRecipeScraped?.(result)
				onClose?.()
			}
		} catch (err) {
			console.error('Recipe scraping error:', err)
			
			// Provide more specific error messages based on the error type
			if (err instanceof TypeError && err.message.includes('fetch')) {
				error = 'Unable to connect to the recipe scraper. Please check your internet connection and try again.'
			} else if (err instanceof Error) {
				error = err.message || 'Failed to scrape recipe'
			} else {
				error = 'An unexpected error occurred while scraping the recipe'
			}
		} finally {
			isLoading = false
		}
	}

	function handleUrlInput(event: Event) {
		const target = event.target as HTMLInputElement
		url = target.value
		error = null
	}
</script>

<div class="recipe-scraper">
	<div class="scraper-form">
		<Input bind:value={url}>
			<input
				placeholder="Enter recipe URL"
				bind:value={url}
				oninput={handleUrlInput}
				disabled={isLoading}
			/>
		</Input>
		<Button
			onclick={handleScrape}
			disabled={isLoading || !url.trim()}
			color="neutral"
		>
			{isLoading ? 'Scraping...' : 'Scrape Recipe'}
		</Button>
	</div>
	
	{#if error}
		<WarningBox message={error} />
	{/if}
	
	{#if isLoading}
		<div class="loading-message">
			<p>Scraping recipe data...</p>
			<p class="loading-note">This may take a few moments depending on the website.</p>
		</div>
	{/if}
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.recipe-scraper {
		max-width: 800px;
		margin: 0 auto;
	}

	.scraper-form {
		display: flex;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-xl);

		@include mobile {
			flex-direction: column;
		}
	}

	.loading-message {
		text-align: center;
		margin-top: var(--spacing-lg);
		color: var(--color-text-on-surface);
		
		p {
			margin: 0;
			&:first-child {
				font-weight: 500;
				margin-bottom: var(--spacing-xs);
			}
		}
		
		.loading-note {
			font-size: var(--font-size-sm);
			color: var(--color-text-on-surface-secondary);
		}
	}
</style>
