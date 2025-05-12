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
	<button class="back-button" onclick={onBackClick}>
		<svg width="24" height="24" viewBox="0 0 24 24">
			<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
		</svg>
	</button>

	<div class="recipe-image">
		{@render image()}
	</div>

	<div class="tags">
		{@render tags()}
	</div>

	<div class="bottom-container">
		<div class="nav-buttons">
			{@render navButtons()}
		</div>
	</div>

	<div class="recipe-content">
		<div class="title">
			{@render title()}
		</div>

		<div class="action-buttons">
			{@render actionButtons()}
		</div>

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
	@import '$lib/global.scss';

	.recipe {
		@include tablet {
			display: block;
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100dvh;
			overflow-y: auto;
			background: var(--color-neutral-dark);
		}
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
		position: relative;
		width: 100%;
		height: auto;
		max-height: 80dvh;
		background: transparent;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;

		:global(img) {
			width: 100%;
			height: 100%;
			object-fit: cover;
			border-bottom-left-radius: var(--border-radius-xl);
			border-bottom-right-radius: var(--border-radius-xl);
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
		padding: var(--spacing-md) var(--spacing-lg);
		padding-bottom: 0;
	}

	.action-buttons {
		display: flex;
		justify-content: center;
		gap: var(--spacing-xl);
	}

	.bottom-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(53, 47, 52, 0.8);
		z-index: var(--z-sticky);
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		padding-bottom: env(safe-area-inset-bottom);
		margin: var(--spacing-sm);
		border-radius: var(--border-radius-lg);
	}

	.nav-buttons {
		display: flex;
		justify-content: space-around;
		padding: var(--spacing-sm) var(--spacing-md);
	}

	.recipe-content {
		padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}
</style>
