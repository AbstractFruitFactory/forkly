<script lang="ts">
	import type { Recipe as DBRecipe } from '$lib/server/db/schema'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'

	type Recipe = DBRecipe & {
		likes: number
	}

	let { recipe, recipeHref }: { recipe: Recipe; recipeHref?: string } = $props()
</script>

<a href={`${recipeHref}/${recipe.id}`} class="recipe-card">
	<div class="content">
		<h3>{recipe.title}</h3>
		<div class="recipe-meta">
			<LikeButton count={recipe.likes || 0} />
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
                        color: var(--color-text-on-surface);
                }
	}

	.content {
		padding: var(--spacing-lg);
		flex: 1;
		min-width: 0; /* Prevent text overflow issues */
	}

	.recipe-meta {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
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
