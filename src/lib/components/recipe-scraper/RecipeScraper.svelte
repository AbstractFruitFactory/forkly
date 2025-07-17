<script lang="ts">
	import { scrapeRecipe, isValidRecipeUrl, type RecipeData } from '$lib/utils/recipeScraper'
	import Button from '$lib/components/button/Button.svelte'
	import Input from '$lib/components/input/Input.svelte'
	import Toast from '$lib/components/toast/Toast.svelte'

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
	let showToast = $state(false)

	async function handleScrape() {
		if (!url.trim()) {
			error = 'Please enter a recipe URL'
			showToast = true
			return
		}

		if (!isValidRecipeUrl(url)) {
			error = 'Please enter a valid recipe URL from a supported website'
			showToast = true
			return
		}

		isLoading = true
		error = null

		try {
			const result = await scrapeRecipe(url)

			if ('error' in result) {
				error = result.error
				showToast = true
			} else {
				onRecipeScraped?.(result)
				onClose?.()
			}
		} catch (err) {
			error = 'Failed to scrape recipe'
			showToast = true
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
				placeholder="Enter recipe URL (e.g., https://www.allrecipes.com/recipe/...)"
				bind:value={url}
				oninput={handleUrlInput}
				disabled={isLoading}
			/>
		</Input>
		<Button onclick={handleScrape} disabled={isLoading || !url.trim()}>
			{isLoading ? 'Scraping...' : 'Scrape Recipe'}
		</Button>
	</div>
</div>

{#if showToast && error}
	<Toast message={error} type="error" />{/if}

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
</style>
