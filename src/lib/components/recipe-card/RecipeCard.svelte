<script lang="ts">
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
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'
	import { formatNumberShort } from '$lib/utils/format'

	let {
		recipe,
		loading = false,
		menu,
		onRecipeClick
	}: {
		recipe?: DetailedRecipe
		loading?: boolean
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

	const handleMenuToggle = (e: MouseEvent | TouchEvent) => {
		e.preventDefault()
		e.stopPropagation()
		menuOpen = !menuOpen
		if (menuOpen) {
			updateDropdownPosition()
		}
	}

	const handleTouchStart = (e: TouchEvent) => {
		e.stopPropagation()
	}

	const handleTouchEnd = (e: TouchEvent) => {
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
	aria-labelledby={recipe ? `recipe-title-${recipe.id}` : undefined}
	onclick={handleClick}
>
	<div class="image-container" class:no-image={recipe && !recipe.imageUrl}>
		{#if loading}
			<div
				style="width: 100%; height: 100%; aspect-ratio: 16/9; border-radius: var(--border-radius-2xl) var(--border-radius-2xl) 0 0; position: absolute; top: 0; left: 0; overflow: hidden;"
			>
				<Skeleton width="100%" height="100%" />
			</div>
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
					ontouchstart={handleTouchStart}
					ontouchend={handleTouchEnd}
					aria-label="Recipe menu"
				>
					<MoreVertical size={20} color="black" />
				</button>
			{/if}
		</div>
	</div>

	<div class="content">
		{#if recipe?.user && !loading}
			<div class="avatar">
				<ProfilePic profilePicUrl={recipe.user.avatarUrl} size="sm" background />
			</div>
		{/if}

		<div>
			{#if loading}
				<div class="title">
					<Skeleton width="80%" height="32px" />
				</div>
			{:else if recipe}
				<h2 class="recipe-title" style:margin="0">{recipe.title}</h2>
			{/if}
		</div>

		<div class="meta-single" aria-label="Recipe details">
			{#if loading}
				<div class="tags">
					{#each Array(3) as _}
						<div
							style="border-radius: var(--border-radius-xl); overflow: hidden; width: 60px; height: 24px;"
						>
							<Skeleton height="100%" />
						</div>
					{/each}
				</div>
			{:else if recipe?.tags && recipe.tags.length > 0}
				<div class="tags">
					{#each recipe.tags as tag}
						<Pill text={tag} color="var(--color-text-on-surface)" />
					{/each}
				</div>
			{/if}
			{#if loading}
				<span class="text">
					<Skeleton width="60px" height="16px" />
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
						{formatNumberShort(recipe.likes)}
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
		<Dropdown bind:isOpen={menuOpen} nbrOfItems={Object.keys(menu.options).length}>
			{#snippet dropdownContent(item)}
				{#each Object.entries(menu.options) as [label, action], i}
					{#snippet menuLabel()}
						{label}
					{/snippet}

					{@render item(
						menuLabel,
						() => {
							menuOpen = false
							action()
						},
						i
					)}
				{/each}
			{/snippet}
		</Dropdown>
	</div>
{/if}

<style lang="scss">
	@import '$lib/global.scss';
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

		@include mobile {
			height: 300px;
			grid-template-rows: 45% auto;

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

		@include hover {
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

		@include mobile {
			font-size: var(--font-size-lg);
		}
	}

	.image-container {
		border-radius: var(--border-radius-2xl) var(--border-radius-2xl) 0 0;
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
		z-index: var(--z-dropdown);
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
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);

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
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: var(--spacing-sm);
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		min-width: 40px;
		min-height: 40px;
		background: rgba(255, 255, 255, 0.7);
		filter: brightness(1.1);

		&:hover {
			transform: scale(1.05);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		}

		&:active {
			transform: scale(0.95);
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
