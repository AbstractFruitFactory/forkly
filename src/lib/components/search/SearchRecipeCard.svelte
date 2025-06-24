<script lang="ts">
	import Pill from '$lib/components/pill/Pill.svelte'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import RecipeImagePlaceholder from '$lib/components/recipe-image-placeholder/RecipeImagePlaceholder.svelte'

	type Recipe = {
		id: string
		title: string
		imageUrl?: string
		tags?: string[]
		likes?: number
	}

	let {
		recipe,
		onClick
	}: {
		recipe: Recipe
		onClick?: () => void
	} = $props()
</script>

<div
	class="search-recipe-card"
	class:has-image={!!recipe.imageUrl}
	onclick={onClick}
	onkeydown={(e) => e.key === 'Enter' && onClick?.()}
	role="button"
	tabindex="0"
>
	<div class="card-background">
		{#if recipe.imageUrl}
			<img src={recipe.imageUrl} alt={recipe.title} loading="lazy" decoding="async" />
		{:else}
			<RecipeImagePlaceholder size="small" />
		{/if}
	</div>

	<div class="overlay"></div>

	<div class="content">
		<h3 class="title">{recipe.title}</h3>

		<div class="details">
			<div class="action-container">
				<LikeButton count={recipe.likes ?? 0} interactive={false} />
			</div>
			
			{#if recipe.tags && recipe.tags.length > 0}
				<div class="diet-tags">
					{#each recipe.tags.slice(0, 2) as tag}
						<div class="small-pill">
							<Pill text={tag} />
						</div>
					{/each}
					{#if recipe.tags.length > 2}
						<span class="more-diets">+{recipe.tags.length - 2}</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.search-recipe-card {
		position: relative;
		border-radius: var(--border-radius-lg);
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		width: 100%;
		height: 200px;
		flex-shrink: 0;
		box-shadow: var(--shadow-md);
		overflow: hidden;
		border: none;

		&.has-image {
			border-color: transparent;
		}

		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 2px;
			background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
			opacity: 0;
			transition: opacity 0.3s ease;
			z-index: var(--z-elevated);
		}

		&:hover {
			box-shadow: var(--shadow-lg);

			&::after {
				opacity: 1;
			}

			.card-background img {
				transform: scale(1.1);
			}
		}

		&:focus-visible {
			outline: none;
			box-shadow:
				0 0 0 2px var(--color-primary),
				0 8px 16px rgba(0, 0, 0, 0.2);
		}
	}

	.card-background {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(145deg, var(--color-neutral-dark), var(--color-neutral));

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		}
	}

	.overlay {
		position: absolute;
		inset: 0;
		z-index: var(--z-elevated);
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.9) 0%,
			rgba(0, 0, 0, 0.7) 50%,
			rgba(0, 0, 0, 0.4) 100%
		);
		opacity: 0.8;
	}

	.content {
		position: relative;
		z-index: 3;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		height: 100%;
		padding: var(--spacing-lg);
		box-sizing: border-box;
	}

	.title {
		margin: 0;
		font-size: var(--font-size-xl);
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		color: white;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
		letter-spacing: 0.01em;
		margin-bottom: var(--spacing-md);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		white-space: normal;
		line-height: 1.3;
	}

	.details {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: var(--font-size-xs);
		color: var(--color-neutral-light);
	}

	.diet-tags {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.small-pill {
		transform: scale(0.85);
		transform-origin: left center;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
	}

	.more-diets {
		font-size: var(--font-size-xs);
		color: white;
		background: rgba(255, 255, 255, 0.2);
		padding: 0 var(--spacing-xs);
		border-radius: var(--border-radius-xs);
		backdrop-filter: blur(4px);
	}

	.action-container {
		display: flex;
		gap: var(--spacing-xs);
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
		
		:global(.like-button) {
			background: rgba(0, 0, 0, 0.3);
			backdrop-filter: blur(4px);
		}
	}
</style>
