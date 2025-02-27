<script lang="ts">
	import Timer from 'lucide-svelte/icons/timer'
	import List from 'lucide-svelte/icons/list'
	import Utensils from 'lucide-svelte/icons/utensils'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import { dietColors } from '$lib/types'
	import type { DietType } from '$lib/types'

	interface Recipe {
		id: string
		title: string
		description?: string
		ingredients: number
		instructions: number
		imageUrl?: string | null
		diets?: DietType[]
		user?: {
			username: string
			avatarUrl?: string | null
		}
		likes: number
	}

	let {
		recipe
	}: {
		recipe: Recipe
	} = $props()
</script>

<a href="/recipe/{recipe.id}" class="recipe-card" aria-labelledby="recipe-title-{recipe.id}">
	<div class="header">
		<div class="image-container" class:no-image={!recipe.imageUrl}>
			{#if recipe.imageUrl}
				<img src={recipe.imageUrl} alt="" aria-hidden="true" loading="lazy" decoding="async" />
			{:else}
				<div class="placeholder">
					<Utensils size={32} strokeWidth={1.5} />
				</div>
			{/if}
		</div>
		{#if recipe.user}
			<div
				class="avatar"
				style="background: {recipe.user.avatarUrl
					? `url(${recipe.user.avatarUrl}) center/cover`
					: `var(--color-${recipe.user.username.charCodeAt(0) % 5})`}"
			>
				{#if !recipe.user.avatarUrl}
					{recipe.user.username[0].toUpperCase()}
				{/if}
			</div>
		{/if}
		<LikeButton count={recipe.likes} />
	</div>
	<div class="content">
		<h2 id="recipe-title-{recipe.id}">{recipe.title}</h2>
		{#if recipe.description}
			<p class="description">{recipe.description}</p>
		{/if}
		<div class="meta" aria-label="Recipe details">
			<span>
				<List size={16} aria-hidden="true" />
				<span>{recipe.ingredients} ingredients</span>
			</span>
			<span>
				<Timer size={16} aria-hidden="true" />
				<span>{recipe.instructions} steps</span>
			</span>
		</div>
		
		{#if recipe.diets && recipe.diets.length > 0}
			<div class="tags">
				{#each recipe.diets as diet}
					<Pill text={diet} color={dietColors[diet]} />
				{/each}
			</div>
		{/if}
	</div>
</a>

<style lang="scss">
	.recipe-card {
		display: block;
		border-radius: var(--border-radius-lg);
		background: var(--color-neutral-dark);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: var(--shadow-sm);
		text-decoration: none;
		overflow: hidden;
		position: relative;
		isolation: isolate;
		transition:
			transform var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out),
			border-color var(--transition-fast) var(--ease-out);

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: var(--color-primary);
			opacity: 0;
			z-index: -1;
			transition: opacity var(--transition-fast) var(--ease-out);
			will-change: opacity;
		}

		&:hover {
			transform: translateY(calc(var(--spacing-xs) * -1));
			box-shadow: var(--shadow-lg);
			border-color: rgba(255, 255, 255, 0.2);

			&::after {
				opacity: 0.03;
			}
		}

		&:focus {
			outline: none;
		}

		&:focus-visible {
			outline: 2px solid var(--color-primary);
			outline-offset: 2px;
		}
	}

	.header {
		position: relative;
		
		:global(.like-button) {
			position: absolute;
			top: var(--spacing-md);
			right: var(--spacing-md);
			z-index: 2;
		}
	}

	.image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: var(--color-neutral-darker, rgba(0, 0, 0, 0.2));

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
			z-index: 1;
			pointer-events: none;
		}

		&.no-image {
			background: linear-gradient(135deg, var(--color-neutral-dark), var(--color-neutral));

			&::after {
				background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
			}
		}

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform var(--transition-fast) var(--ease-out);
			will-change: transform;
		}
	}

	.placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.5);

		:global(svg) {
			filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
		}
	}

	.avatar {
		position: absolute;
		bottom: -16px;
		right: var(--spacing-md);
		width: 32px;
		height: 32px;
		border-radius: 50%;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-sm);
		font-weight: 600;
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		box-shadow: var(--shadow-md);
		border: 2px solid var(--color-background);
		z-index: 2;
	}

	.recipe-card:hover .image-container img {
		transform: scale(1.05);
	}

	.content {
		padding: var(--spacing-lg);
	}

	h2 {
		margin: 0 0 var(--spacing-md);
		font-size: var(--font-size-xl);
		font-weight: 600;
		letter-spacing: -0.01em;
		line-height: 1.3;
		color: var(--color-neutral-light);
	}

	.description {
		margin: 0 0 var(--spacing-lg);
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		color: var(--color-neutral-light);
		line-height: 1.5;
		opacity: 0.8;
		font-size: var(--font-size-sm);
	}

	.meta {
		display: flex;
		gap: var(--spacing-lg);
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
		padding-top: var(--spacing-sm);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		opacity: 0.7;
		transition: opacity var(--transition-fast) var(--ease-out);

		span {
			display: flex;
			align-items: center;
			gap: var(--spacing-xs);
		}
	}

	.recipe-card:hover .meta {
		opacity: 1;
	}

	@media (max-width: 600px) {
		.content {
			padding: var(--spacing-md);
		}

		h2 {
			font-size: var(--font-size-lg);
		}

		.meta {
			font-size: var(--font-size-xs);
			gap: var(--spacing-md);
		}
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
		margin-top: var(--spacing-md);
	}
</style>
