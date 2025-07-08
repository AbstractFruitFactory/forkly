<script lang="ts">
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import Dropdown from '$lib/components/dropdown/Dropdown.svelte'
	import MoreVertical from 'lucide-svelte/icons/more-vertical'
	import Carrot from 'lucide-svelte/icons/carrot'
	import List from 'lucide-svelte/icons/list'
	import Heart from 'lucide-svelte/icons/heart'
	import Pill from '$lib/components/pill/Pill.svelte'
	import ProfilePic from '$lib/components/profile-pic/ProfilePic.svelte'
	import RecipeImagePlaceholder from '$lib/components/recipe-image-placeholder/RecipeImagePlaceholder.svelte'
	import type { DetailedRecipe } from '$lib/server/db/recipe'
	import { afterNavigate } from '$app/navigation'

	let {
		recipe,
		loading = false,
		size = 'large',
		menu,
		onRecipeClick
	}: {
		recipe?: DetailedRecipe
		loading?: boolean
		size?: 'large' | 'small'
		menu?: {
			options: { [key: string]: () => void }
		}
		onRecipeClick?: (recipe: DetailedRecipe, event: MouseEvent) => Promise<void>
	} = $props()

	let isNavigating = $state(false)
	let menuOpen = $state(false)
	let menuButton: HTMLButtonElement
	let dropdownPosition = $state({ top: 0, left: 0 })

	const handleClick = (event: MouseEvent) => {
		if (!recipe) return
		isNavigating = true
		onRecipeClick?.(recipe, event).then(() => {
			isNavigating = false
		})
	}

	afterNavigate(() => {
		isNavigating = false
	})

	const updateDropdownPosition = () => {
		if (menuButton) {
			const rect = menuButton.getBoundingClientRect()
			dropdownPosition = {
				top: rect.bottom + window.scrollY + 8,
				left: rect.left + window.scrollX
			}
		}
	}

	const handleMenuToggle = (e: MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		menuOpen = !menuOpen
		if (menuOpen) {
			updateDropdownPosition()
		}
	}

	$effect(() => {
		if (menuOpen) {
			updateDropdownPosition()
		}
	})
</script>

<a
	href={recipe ? `/recipe/${recipe.id}` : undefined}
	class="recipe-card card"
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
			<RecipeImagePlaceholder size="medium" />
		{/if}
		<div class="action-buttons">
			{#if recipe && menu}
				<button
					bind:this={menuButton}
					class="menu-btn"
					onclick={handleMenuToggle}
					aria-label="Recipe menu"
				>
					<MoreVertical size={16} />
				</button>
			{/if}
		</div>
	</div>

	<div class="content">
		{#if recipe?.user && !loading}
			<div class="avatar">
				<ProfilePic profilePicUrl={recipe.user.avatarUrl} size="sm" />
			</div>
		{/if}

		<div>
			<div class="tags">
				{#if loading}
					{#each Array(3) as _}
						<div class="tag">
							<div class="gradient-animate"></div>
						</div>
					{/each}
				{:else if recipe?.tags && recipe.tags.length > 0}
					{#each recipe.tags as tag}
						<Pill text={tag} color="var(--color-text-on-surface)" />
					{/each}
				{/if}
			</div>

			<div style:margin-top="var(--spacing-sm)">
				{#if loading}
					<div class="title">
						<div class="gradient-animate"></div>
					</div>
				{:else if recipe}
					<h3 class="recipe-title" style:margin="0">{recipe.title}</h3>
				{/if}
			</div>
		</div>
		<div class="meta-single" aria-label="Recipe details">
			{#if loading}
				<span class="text">
					<div class="gradient-animate"></div>
				</span>
			{:else if recipe}
				<span class="meta-content">
					<span class="meta-item">
						<Carrot size={16} />
						{recipe.ingredients.length}
					</span>
					<span class="meta-item">
						<List size={16} />
						{recipe.instructions.length}
					</span>
					<span class="meta-item likes">
						<Heart size={16} />
						{recipe.likes}
					</span>
				</span>
			{/if}
		</div>
	</div>

	{#if isNavigating}
		<div class="spinner-overlay">
			<div class="spinner"></div>
		</div>
	{/if}
</a>

{#if menu && menuOpen}
	<div
		class="portal-dropdown-container"
		style="position: fixed; top: {dropdownPosition.top}px; left: {dropdownPosition.left}px; z-index: 1000;"
	>
		<Dropdown bind:isOpen={menuOpen}>
			{#each Object.entries(menu.options) as [label, action]}
				<button
					class="dropdown-item"
					class:delete={['Delete', 'Remove'].includes(label)}
					onclick={() => {
						menuOpen = false
						action()
					}}>{label}</button
				>
			{/each}
		</Dropdown>
	</div>
{/if}

<style lang="scss">
	.recipe-card {
		display: grid;
		grid-template-rows: 60% auto;
		height: 435px;
		width: 100%;
		border-radius: var(--border-radius-2xl);
		text-decoration: none;
		overflow: hidden;
		position: relative;
		padding: 0;
		transition:
			transform var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out),
			border-color var(--transition-fast) var(--ease-out);

		&.small {
			height: 300px;
			grid-template-rows: 55% auto;

			.avatar-wrapper {
				bottom: -12px;
			}

			.content {
				padding: var(--spacing-sm);
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

	.recipe-title {
		font-family: var(--font-serif);
		word-break: break-word;
		overflow-wrap: break-word;
		hyphens: auto;
		white-space: normal;
		word-wrap: break-word;
		text-overflow: ellipsis;
		overflow: hidden;
		display: -webkit-box;
		color: var(--color-text-on-surface);
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
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

	.avatar {
		position: absolute;
		top: -16px;
		right: var(--spacing-md);
		z-index: var(--z-index-elevated);
	}

	.recipe-card:hover .image-container img {
		transform: scale(1.05);
	}

	.content {
		position: relative;
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--spacing-sm);
		min-width: 0;
	}

	.description {
		margin: 0;
		overflow: hidden;
		color: var(--color-neutral-light);
		opacity: 0.8;
		font-size: var(--font-size-sm);
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
		opacity: 0.8;

		span {
			color: var(--color-text-on-surface);
			font-size: var(--font-size-sm);

			:global(svg) {
				stroke: var(--color-text-on-surface);
			}
		}
	}

	.meta-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		justify-content: space-between;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.meta-item.likes {
		margin-left: auto;
	}

	.separator {
		color: var(--color-neutral);
		opacity: 0.5;
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

	.menu-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-full);
		background: var(--color-neutral-2);
		border: 1px solid var(--color-neutral);
		padding: 0 var(--spacing-xs);
		color: var(--color-neutral-light);
		cursor: pointer;
		transition: background-color var(--transition-fast) var(--ease-in-out);

		&:hover {
			background-color: var(--color-neutral);
		}
	}

	.dropdown-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: var(--spacing-sm) var(--spacing-md);
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-white);

		&:hover {
			background-color: var(--color-hover);
		}
	}

	.dropdown-item.delete {
		color: var(--color-error);
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.portal-dropdown-container {
		animation: dropdown-fade-in 0.2s ease-out;
	}

	@keyframes dropdown-fade-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
