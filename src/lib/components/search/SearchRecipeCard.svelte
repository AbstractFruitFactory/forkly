<script lang="ts">
	import Clock from 'lucide-svelte/icons/clock'
	import Utensils from 'lucide-svelte/icons/utensils'
	import Pill from '$lib/components/pill/Pill.svelte'
	import { dietColors } from '$lib/types'
	import type { DietType } from '$lib/types'

	interface Recipe {
		id: string
		title: string
		imageUrl?: string
		cookTime?: number
		diets?: DietType[]
	}

	let {
		recipe,
		onClick
	}: {
		recipe: Recipe
		onClick?: () => void
	} = $props()
</script>

<div class="search-recipe-card" on:click={onClick} on:keydown={(e) => e.key === 'Enter' && onClick?.()}>
	<div class="image-container" class:no-image={!recipe.imageUrl}>
		{#if recipe.imageUrl}
			<img src={recipe.imageUrl} alt={recipe.title} loading="lazy" decoding="async" />
		{:else}
			<div class="placeholder">
				<Utensils size={20} strokeWidth={1.5} />
			</div>
		{/if}
	</div>
	
	<div class="content">
		<h3 class="title">{recipe.title}</h3>
		
		<div class="details">
			{#if recipe.cookTime}
				<span class="cook-time">
					<Clock size={14} aria-hidden="true" />
					<span>{recipe.cookTime} min</span>
				</span>
			{/if}
			
			{#if recipe.diets && recipe.diets.length > 0}
				<div class="diet-tags">
					{#each recipe.diets.slice(0, 2) as diet}
						<div class="small-pill">
							<Pill text={diet} color={dietColors[diet]} />
						</div>
					{/each}
					{#if recipe.diets.length > 2}
						<span class="more-diets">+{recipe.diets.length - 2}</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.search-recipe-card {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-md);
		cursor: pointer;
		transition: background-color var(--transition-fast) var(--ease-in-out);
		
		&:hover {
			background-color: var(--color-neutral-darker, rgba(255, 255, 255, 0.05));
		}
		
		&:focus-visible {
			outline: 2px solid var(--color-primary);
			outline-offset: 2px;
		}
	}
	
	.image-container {
		width: 50px;
		height: 50px;
		border-radius: var(--border-radius-sm);
		overflow: hidden;
		background-color: var(--color-neutral-dark);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		
		&.no-image {
			background: linear-gradient(135deg, var(--color-neutral-dark), var(--color-neutral));
		}
	}
	
	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.5);
		height: 100%;
		width: 100%;
	}
	
	.content {
		flex: 1;
		min-width: 0; /* Prevent text from overflowing */
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}
	
	.title {
		margin: 0;
		font-size: var(--font-size-sm);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--color-neutral-light);
	}
	
	.details {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: var(--font-size-xs);
		color: var(--color-neutral);
	}
	
	.cook-time {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}
	
	.diet-tags {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}
	
	.small-pill {
		transform: scale(0.8);
		transform-origin: left center;
	}
	
	.more-diets {
		font-size: var(--font-size-xs);
		color: var(--color-neutral);
		background: rgba(255, 255, 255, 0.1);
		padding: 0 var(--spacing-xs);
		border-radius: var(--border-radius-xs);
	}
</style> 