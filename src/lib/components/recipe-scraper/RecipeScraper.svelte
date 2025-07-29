<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'
	import Input from '$lib/components/input/Input.svelte'
	import WarningBox from '$lib/components/warning-box/WarningBox.svelte'
	import { safeFetch } from '$lib/utils/fetch'
	import type { RecipeData } from '../../pages/new-recipe/NewRecipe.svelte'

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

	async function pollJobStatus(jobId: string, maxAttempts = 60, interval = 2000): Promise<any> {
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			await new Promise((res) => setTimeout(res, interval))
			const statusResult = await safeFetch()(`/import-recipe/status/${jobId}`)
			if (statusResult.isErr()) {
				throw new Error(statusResult.error.message)
			}
			const data = statusResult.value as any
			if (data.status === 'completed' && data.result) {
				return data.result
			}
			if (data.status === 'failed') {
				throw new Error(data.error || 'Recipe import failed')
			}
		}
		throw new Error('Timed out waiting for recipe import')
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
			const result = await safeFetch()('/import-recipe', {
				method: 'POST',
				body: JSON.stringify({ url })
			})

			if (result.isErr()) {
				error = result.error.message
			} else {
				const { jobId } = result.value as any
				if (!jobId) {
					error = 'Failed to start recipe import. Please try again.'
					return
				}
				const recipe = await pollJobStatus(jobId)
				if (!recipe.title || !recipe.instructions) {
					error = 'The recipe data appears to be incomplete. Please try a different recipe URL.'
					return
				}
				onRecipeScraped?.(recipe)
				onClose?.()
			}
		} catch (err) {
			console.error('Recipe scraping error:', err)
			if (err instanceof Error) {
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
			loading={isLoading}
			onclick={handleScrape}
			disabled={isLoading || !url.trim()}
			color="neutral"
		>
			Import
		</Button>
	</div>

	{#if error}
		<WarningBox message={error} />
	{/if}

	{#if isLoading}
		<div class="loading-message">
			<p>Please wait while we import the recipe...</p>
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
