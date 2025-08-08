<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		onBackClick,
		image,
		tags,
		navButtons,
		title,
		actionButtons,
		description,
		nutrition,
		ingredients,
		instructions,
		comments
	}: {
		onBackClick?: () => void
		image: Snippet
		tags: Snippet
		navButtons: Snippet
		title: Snippet
		actionButtons: Snippet
		description: Snippet
		nutrition: Snippet
		ingredients: Snippet
		instructions: Snippet
		comments: Snippet
	} = $props()
</script>

<div class="recipe" data-page="recipe">
	<div class="recipe-image">
		{@render image()}
	</div>

	<div class="header">
		<div class="tags">
			{@render tags()}
		</div>

		<div class="title">
			{@render title()}
		</div>

		<div class="action-buttons">
			{@render actionButtons()}
		</div>
	</div>

	<div class="content">
		{@render description()}
		{@render nutrition()}
		{@render ingredients()}
		{@render instructions()}

		<div style:margin-bottom="var(--spacing-2xl)">
			{@render comments()}
		</div>
	</div>
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.recipe {
		position: relative;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		margin: var(--spacing-xl) 0;
	}

	.recipe-image {
		min-height: 200px;
		max-height: 80dvh;
		border-radius: var(--border-radius-lg);
		overflow: hidden;

		:global(img) {
			display: block;
			width: 100%;
			object-fit: cover;
			border-radius: var(--border-radius-lg);
		}
	}

	.title {
		text-align: center;
	}

	.tags {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}

	.action-buttons {
		display: flex;
		justify-content: center;
		gap: var(--spacing-xl);
	}

	.content {
		display: flex;
		flex-direction: column;
	}
</style>
