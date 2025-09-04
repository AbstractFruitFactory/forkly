<script lang="ts">
	import type { Ingredient } from '$lib/types'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import { getDisplayIngredient } from '$lib/utils/ingredient-formatting'

	let {
		ingredients,
		servings,
		originalServings,
		onServingsChange,
		unitSystem = 'imperial',
		loading = false,
		showServingsAdjuster = true
	}: {
		ingredients: Ingredient[]
		servings: number
		originalServings: number
		onServingsChange?: (newServings: number) => void
		unitSystem?: UnitSystem
		loading?: boolean
		showServingsAdjuster?: boolean
	} = $props()

	let currentServings = $state(servings)

	let displayIngredients = $derived(
		ingredients.map((ingredient: Ingredient) =>
			getDisplayIngredient(ingredient, currentServings, originalServings, unitSystem)
		)
	)

	const handleServingsChange = (newServings: number) => {
		currentServings = newServings
		if (onServingsChange) onServingsChange(newServings)
	}
</script>

<ul class="ingredients-list card">
	{#if loading}
		{#each Array(10) as _, i}
			<li>
				<div class="quantity">
					<Skeleton width="3rem" height="1rem" />
				</div>
				<div class="measurement">
					<Skeleton width="4rem" height="1rem" />
				</div>
				<div class="ingredient-name">
					<Skeleton width="8rem" height="1rem" />
				</div>
			</li>
		{/each}
	{:else}
		{#if showServingsAdjuster}
			<div class="ingredients-header">
				<ServingsAdjuster servings={currentServings} onServingsChange={handleServingsChange} />
			</div>
		{/if}
		{#each displayIngredients as ingredient}
			<li>
				{#if ingredient.displayMeasurementAndQuantity}
					<span class="measurement">{ingredient.displayMeasurementAndQuantity}</span>
				{/if}
				<span class="ingredient-name">{ingredient.displayName}</span>
			</li>
		{/each}
	{/if}
</ul>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.ingredients-list {
		padding: var(--spacing-lg);
		li {
			list-style: none;
			padding: var(--spacing-md) 0;
			border-bottom: 2px dotted var(--color-text-on-surface);
			display: flex;
			font-size: var(--font-size-sm);
			width: 100%;
			color: var(--color-text-on-surface);

			&:first-of-type {
				padding-top: 0;
			}

			&:last-child {
				border-bottom: none;
			}
		}
	}

	.ingredients-header {
		display: flex;
		margin-bottom: var(--spacing-lg);
	}

	.quantity,
	.measurement {
		margin-right: var(--spacing-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-on-surface);
	}

	.ingredient-name {
		color: var(--color-neutral-lightest);
	}
</style>
