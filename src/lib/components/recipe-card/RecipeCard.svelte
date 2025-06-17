<script lang="ts">
	import Utensils from 'lucide-svelte/icons/utensils'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import { navigating } from '$app/state'
	import type { DetailedRecipe } from '$lib/server/db/recipe'

	let {
		recipe,
		loading = false,
		size = 'large'
	}: {
		recipe?: DetailedRecipe
		loading?: boolean
		size?: 'large' | 'small'
	} = $props()

	let isNavigating = $state(false)

	const handleClick = (event: MouseEvent) => {
		if (!recipe) return
		isNavigating = true
	}

	$effect(() => {
		if (isNavigating && !navigating) {
			isNavigating = false
		}
	})
</script>

<a
	href={recipe ? `/recipe/${recipe.id}` : undefined}
	class="recipe-card"
	class:skeleton={loading || isNavigating}
	class:small={size === 'small'}
	aria-labelledby={recipe ? `recipe-title-${recipe.id}` : undefined}
	onclick={handleClick}
>
	<div class="image-container" class:no-image={recipe && !recipe.imageUrl}>
		{#if loading}
			<div class="gradient-animate"></div>
		{:else if recipe?.imageUrl}
			<img src={recipe.imageUrl} alt="" aria-hidden="true" loading="lazy" decoding="async" />
		{:else}
			<div class="placeholder">
				<Utensils size={32} strokeWidth={1.5} />
			</div>
		{/if}
		<div class="action-buttons">
			{#if recipe}
				<LikeButton count={recipe.likes} />
			{/if}
		</div>
	</div>
	{#if loading}
		<div class="avatar">
			<div class="gradient-animate"></div>
		</div>
	{:else if recipe?.user}
		<div
			class="avatar"
			style="background: {recipe.user.avatarUrl
				? `url(${recipe.user.avatarUrl}) center/cover`
				: `var(--color-${recipe.user.username!.charCodeAt(0) % 5})`}"
		>
			{#if !recipe.user.avatarUrl}
				{recipe.user.username?.[0]?.toUpperCase()}
			{/if}
		</div>
	{/if}

	<div class="content">
		<div class="tags">
			{#if loading}
				{#each Array(3) as _}
					<div class="tag">
						<div class="gradient-animate"></div>
					</div>
				{/each}
			{:else if recipe?.tags && recipe.tags.length > 0}
				{#each recipe.tags as tag}
					<Pill text={tag} />
				{/each}
			{/if}
		</div>
		{#if loading}
			<div class="title">
				<div class="gradient-animate"></div>
			</div>
		{:else if recipe}
			<h4 id="recipe-title-{recipe.id}" style:margin="0">{recipe.title}</h4>
		{/if}
		<div class="meta-single" aria-label="Recipe details">
			{#if loading}
				<span class="text">
					<div class="gradient-animate"></div>
				</span>
			{:else if recipe}
				<span
					>{recipe.ingredients.length} ingredients &nbsp;|&nbsp; {recipe.instructions.length} steps</span
				>
			{/if}
		</div>
	</div>

	{#if isNavigating}
		<div class="spinner-overlay">
			<div class="spinner"></div>
		</div>
	{/if}
</a>

<style lang="scss">
	.recipe-card {
		display: grid;
		grid-template-rows: 50% auto;
		height: 400px;
		width: 100%;
		border-radius: var(--border-radius-lg);
		background: var(--color-surface);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: var(--shadow-sm);
		text-decoration: none;
		overflow: hidden;
		position: relative;
		transition:
			transform var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out),
			border-color var(--transition-fast) var(--ease-out);

		&.small {
			height: 300px;
			grid-template-rows: 55% auto;

			.avatar {
				width: 24px;
				height: 24px;
				bottom: -12px;
				font-size: var(--font-size-xs);
			}

			.content {
				padding: var(--spacing-sm);
			}

			h4 {
				font-size: var(--font-size-sm);
				word-break: normal;
				overflow-wrap: break-word;
			}

			.meta-single > span {
				font-size: var(--font-size-xs);
			}

			.action-buttons {
				top: var(--spacing-sm);
				right: var(--spacing-sm);
			}
		}

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

	.image-container {
		position: relative;
		width: 100%;
		height: 100%;
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
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--spacing-sm);
		overflow: hidden;
		min-width: 0;
	}

	.description {
		margin: 0;
		overflow: hidden;
		color: var(--color-neutral-light);
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
			padding: var(--spacing-sm);
		}

		h2 {
			font-size: var(--font-size-md);
		}

		.meta {
			font-size: var(--font-size-xs);
			gap: var(--spacing-sm);
		}
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
	}

	.skeleton {
		pointer-events: none;
	}

	.gradient-animate {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.05) 0%,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.15) 50%,
			rgba(255, 255, 255, 0.1) 75%,
			rgba(255, 255, 255, 0.05) 100%
		);
		background-size: 200% 100%;
		animation: gradient-shift 1.5s ease-in-out infinite;
		will-change: background-position;
	}

	.skeleton .image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: var(--color-neutral-darker);
	}

	.skeleton .avatar {
		position: absolute;
		bottom: -16px;
		right: var(--spacing-md);
		width: 32px;
		height: 32px;
		border-radius: 50%;
		overflow: hidden;
		background: var(--color-neutral-darker);
		border: 2px solid var(--color-background);
		z-index: 2;
	}

	.skeleton .like-button {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		overflow: hidden;
		background: var(--color-neutral-darker);
	}

	.skeleton .title {
		position: relative;
		width: 80%;
		height: 24px;
		margin-bottom: var(--spacing-md);
		overflow: hidden;
		background: var(--color-neutral-darker);
	}

	.skeleton .description {
		position: relative;
		width: 100%;
		height: 40px;
		margin-bottom: var(--spacing-lg);
		overflow: hidden;
		background: var(--color-neutral-darker);
	}

	.skeleton .text {
		position: relative;
		width: 60px;
		height: 16px;
		display: inline-block;
		overflow: hidden;
		background: var(--color-neutral-darker);
	}

	.skeleton .tag {
		position: relative;
		width: 80px;
		height: 24px;
		border-radius: var(--border-radius-sm);
		overflow: hidden;
		background: var(--color-neutral-darker);
	}

	@keyframes gradient-shift {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.action-buttons {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		display: flex;
		gap: var(--spacing-xs);
		z-index: 2;
	}

	.bookmark-btn {
		background: rgba(0, 0, 0, 0.32);
		border-radius: 50%;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.meta-single {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
		opacity: 0.8;
		font-weight: 500;
	}

	.spinner-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.5);
		z-index: 10;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid rgba(0, 0, 0, 0.1);
		border-top: 4px solid var(--color-primary, #4f46e5);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
