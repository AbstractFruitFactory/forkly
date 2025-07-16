<script lang="ts">
	import { scrapeRecipe, isValidRecipeUrl, type RecipeData, type ScrapeError } from '$lib/utils/recipeScraper'
	import Button from '$lib/components/button/Button.svelte'
	import Input from '$lib/components/input/Input.svelte'
	import Toast from '$lib/components/toast/Toast.svelte'
	import { goto } from '$app/navigation'

	let {
		onClose
	}: {
		onClose?: () => void
	} = $props()

	let url = $state('')
	let isLoading = $state(false)
	let recipeData: RecipeData | null = $state(null)
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
		recipeData = null

		try {
			const result = await scrapeRecipe(url)
			
			if ('error' in result) {
				error = result.error
				showToast = true
			} else {
				recipeData = result
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

	function handleImport() {
		if (!recipeData) return

		// Convert recipe data to URL parameters
		const params = new URLSearchParams()
		
		// Basic fields
		if (recipeData.title) params.set('title', recipeData.title)
		if (recipeData.description) params.set('description', recipeData.description)
		if (recipeData.total_time) params.set('total_time', recipeData.total_time)
		if (recipeData.yields) params.set('yields', recipeData.yields)
		if (recipeData.difficulty) params.set('difficulty', recipeData.difficulty)
		if (recipeData.image) params.set('image', recipeData.image)
		
		// Ingredients
		if (recipeData.ingredients && recipeData.ingredients.length > 0) {
			params.set('ingredients', JSON.stringify(recipeData.ingredients))
		}
		
		// Instructions
		if (recipeData.instructions && recipeData.instructions.length > 0) {
			params.set('instructions', JSON.stringify(recipeData.instructions))
		}
		
		// Tags
		if (recipeData.tags && recipeData.tags.length > 0) {
			params.set('tags', JSON.stringify(recipeData.tags))
		}

		// Close the popup first
		if (onClose) {
			onClose()
		}

		// Navigate to new recipe page with parameters
		goto(`/new?${params.toString()}`)
	}
</script>

<div class="recipe-scraper">
	<div class="scraper-form">
		<Input bind:value={url}>
			<input
				placeholder="Enter recipe URL (e.g., https://www.allrecipes.com/recipe/...)"
				bind:value={url}
				on:input={handleUrlInput}
				disabled={isLoading}
			/>
		</Input>
		<Button onclick={handleScrape} disabled={isLoading || !url.trim()}>
			{isLoading ? 'Scraping...' : 'Scrape Recipe'}
		</Button>
	</div>

	{#if recipeData}
		<div class="recipe-result">
			<div class="recipe-header">
				<h3>{recipeData.title}</h3>
				<Button onclick={handleImport} color="primary">
					Import Recipe
				</Button>
			</div>
			
			{#if recipeData.image}
				<img src={recipeData.image} alt={recipeData.title} class="recipe-image" />
			{/if}
			
			<div class="recipe-meta">
				{#if recipeData.total_time}
					<span>⏱️ {recipeData.total_time}</span>
				{/if}
				{#if recipeData.yields}
					<span>👥 {recipeData.yields}</span>
				{/if}
				{#if recipeData.difficulty}
					<span>📊 {recipeData.difficulty}</span>
				{/if}
			</div>

			{#if recipeData.description}
				<p class="recipe-description">{recipeData.description}</p>
			{/if}

			{#if recipeData.ingredients && recipeData.ingredients.length > 0}
				<div class="recipe-section">
					<h4>Ingredients</h4>
					<ul>
						{#each recipeData.ingredients as ingredient}
							<li>{ingredient}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if recipeData.instructions && recipeData.instructions.length > 0}
				<div class="recipe-section">
					<h4>Instructions</h4>
					<ol>
						{#each recipeData.instructions as instruction}
							<li>{instruction}</li>
						{/each}
					</ol>
				</div>
			{/if}

			{#if recipeData.tags && recipeData.tags.length > 0}
				<div class="recipe-tags">
					{#each recipeData.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if showToast && error}
	<Toast message={error} type="error" />
{/if}

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

	.recipe-result {
		background: var(--color-secondary);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-xl);
		margin-top: var(--spacing-lg);
	}

	.recipe-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);

		h3 {
			margin: 0;
			flex: 1;
		}

		@include mobile {
			flex-direction: column;
			align-items: stretch;
		}
	}

	.recipe-image {
		width: 100%;
		max-width: 400px;
		height: auto;
		border-radius: var(--border-radius-md);
		margin: var(--spacing-md) 0;
	}

	.recipe-meta {
		display: flex;
		gap: var(--spacing-md);
		margin: var(--spacing-md) 0;
		flex-wrap: wrap;

		span {
			background: var(--color-primary);
			color: white;
			padding: var(--spacing-xs) var(--spacing-sm);
			border-radius: var(--border-radius-sm);
			font-size: 0.9rem;
		}
	}

	.recipe-description {
		font-style: italic;
		color: var(--color-text-secondary);
		margin: var(--spacing-md) 0;
	}

	.recipe-section {
		margin: var(--spacing-lg) 0;

		h4 {
			margin-bottom: var(--spacing-md);
			color: var(--color-primary);
		}

		ul, ol {
			padding-left: var(--spacing-lg);
		}

		li {
			margin-bottom: var(--spacing-xs);
		}
	}

	.recipe-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
		margin-top: var(--spacing-lg);

		.tag {
			background: var(--color-background);
			color: var(--color-text);
			padding: var(--spacing-xs) var(--spacing-sm);
			border-radius: var(--border-radius-sm);
			font-size: 0.8rem;
			border: 1px solid var(--color-border);
		}
	}
</style> 