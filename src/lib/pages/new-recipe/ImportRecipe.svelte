<script lang="ts">
	import RecipeScraper from '$lib/components/recipe-scraper/RecipeScraper.svelte'
	import type { ImportedRecipeData } from '../../../../scripts/import-recipe-worker'
	import Button from '$lib/components/button/Button.svelte'

	let {
		onRecipeScraped,
		onBack
	}: { onRecipeScraped?: (r: ImportedRecipeData) => void; onBack?: () => void } = $props()
</script>

<div class="import-page">
	<div class="content">
		<RecipeScraper {onRecipeScraped} onClose={() => onBack?.()} />
	</div>

	<div class="manual-link">
		<Button variant="text" href="/new/form">Or start fresh manually →</Button>
	</div>
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.import-page {
		max-width: 960px;
		margin: 0 auto;
		padding: var(--spacing-xl) var(--spacing-lg);
	}

	.back {
		background: none;
		border: none;
		color: var(--color-primary);
		cursor: pointer;
		font-size: 1rem;
	}
	.content {
		margin-top: var(--spacing-lg);
	}

	.manual-link {
		margin-top: 16px;
		text-align: center;
	}
	.manual-link a {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 500;
	}
	.manual-link a:hover {
		text-decoration: underline;
	}
</style>
