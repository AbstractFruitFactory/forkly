<script lang="ts">
	import type { Recipe } from '$lib/server/db/schema'
	import Button from '$lib/components/button/Button.svelte'

	let { recipe, recipeHref }: { recipe: Recipe; recipeHref?: string } = $props()
</script>

<a href={`${recipeHref}/${recipe.id}`} class="recipe-card">
	<div class="content">
		<h3>{recipe.title}</h3>
		<div class="recipe-meta">
			<span>❤️ {recipe.likes || 0}</span>
			<span>📅 {new Date(recipe.createdAt).toLocaleDateString()}</span>
		</div>
	</div>
	{#if recipe.imageUrl}
		<div class="image-container">
			<img src={recipe.imageUrl} alt="" aria-hidden="true" loading="lazy" decoding="async" />
		</div>
	{/if}
</a>

<style lang="scss">
	.recipe-card {
		background: var(--color-background);
		padding: 0;
		border-radius: var(--border-radius-xl);
		transition: all var(--transition-fast) var(--ease-in-out);
		border: var(--border-width-thin) solid var(--color-neutral);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
		display: flex;
		align-items: stretch;

		&:hover {
			transform: translateY(-2px);
			box-shadow: var(--shadow-md);
		}

		h3 {
			margin: 0 0 1rem;
			color: white;
		}
	}

	.content {
		padding: var(--spacing-lg);
		flex: 1;
		min-width: 0; /* Prevent text overflow issues */
	}

	.recipe-meta {
		display: flex;
		gap: var(--spacing-md);
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
		margin-bottom: var(--spacing-md);
	}

	.image-container {
		width: 150px;
		overflow: hidden;
		background: var(--color-neutral-darker, rgba(0, 0, 0, 0.2));
		flex-shrink: 0;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform var(--transition-fast) var(--ease-out);
			will-change: transform;
		}
	}

	.recipe-card:hover .image-container img {
		transform: scale(1.05);
	}

	@media (max-width: 480px) {
		.recipe-card {
			flex-direction: column;
		}

		.image-container {
			width: 100%;
			aspect-ratio: 16 / 9;
		}
	}
</style>
