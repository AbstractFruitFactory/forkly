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

	.back-button {
		position: absolute;
		top: var(--spacing-md);
		left: var(--spacing-md);
		z-index: var(--z-drawer);
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: var(--border-radius-full);
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		backdrop-filter: blur(4px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

		svg {
			fill: white;
			width: 20px;
			height: 20px;
		}

		&:hover {
			background: rgba(0, 0, 0, 0.7);
			transform: scale(1.05);
		}

		&:active {
			transform: scale(0.95);
		}
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
