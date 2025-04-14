<script lang="ts">
	import Timer from 'lucide-svelte/icons/timer'
	import List from 'lucide-svelte/icons/list'
	import Utensils from 'lucide-svelte/icons/utensils'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'

	interface Recipe {
		id: string
		title: string
		description?: string
		ingredients: number
		instructions: number
		imageUrl?: string | null
		tags?: string[]
		user?: {
			username: string
			avatarUrl?: string | null
		}
		likes: number
	}

	let {
		recipe,
		loading = false
	}: {
		recipe?: Recipe
		loading?: boolean
	} = $props()
</script>

<a
	href={recipe ? `/recipe/${recipe.id}` : undefined}
	class="recipe-card"
	class:skeleton={loading}
	aria-labelledby={recipe ? `recipe-title-${recipe.id}` : undefined}
>
	<div class="header">
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
					: `var(--color-${recipe.user.username.charCodeAt(0) % 5})`}"
			>
				{#if !recipe.user.avatarUrl}
					{recipe.user.username[0].toUpperCase()}
				{/if}
			</div>
		{/if}
		<div class="action-buttons">
			{#if loading}
				<div class="like-button">
					<div class="gradient-animate"></div>
				</div>
			{:else if recipe}
				<LikeButton count={recipe.likes} />
			{/if}
		</div>
	</div>
	<div class="content">
		{#if loading}
			<div class="title">
				<div class="gradient-animate"></div>
			</div>
		{:else if recipe}
			<h4 id="recipe-title-{recipe.id}">{recipe.title}</h4>
		{/if}
		{#if loading}
			<div class="description">
				<div class="gradient-animate"></div>
			</div>
		{:else if recipe}
			<p class="description dotted-overflow">{recipe.description}</p>
		{/if}
		<div class="meta" aria-label="Recipe details">
			<span>
				<List size={16} aria-hidden="true" />
				{#if loading}
					<span class="text">
						<div class="gradient-animate"></div>
					</span>
				{:else if recipe}
					<span>{recipe.ingredients} ingredients</span>
				{/if}
			</span>
			<span>
				<Timer size={16} aria-hidden="true" />
				{#if loading}
					<span class="text">
						<div class="gradient-animate"></div>
					</span>
				{:else if recipe}
					<span>{recipe.instructions} steps</span>
				{/if}
			</span>
		</div>

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
	</div>
</a>

<style lang="scss">
	.recipe-card {
		display: block;
		height: 360px;
		width: 100%;
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

		.action-buttons {
			position: absolute;
			top: var(--spacing-md);
			right: var(--spacing-md);
			z-index: 2;
			display: flex;
			gap: var(--spacing-xs);
		}
	}

	.image-container {
		position: relative;
		width: 100%;
		height: 180px; /* Fixed height for image */
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
		display: grid;
		grid-template-rows: auto 1fr auto auto;
		height: 180px; /* Fixed height for content */
		gap: var(--spacing-sm);
	}

	h4 {
		margin: 0;
		font-weight: 600;
		color: var(--color-neutral-light);
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
</style>
