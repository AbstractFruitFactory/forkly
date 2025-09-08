<script lang="ts">
	import type { Ingredient } from '$lib/types'
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import { getDisplayIngredient } from '$lib/utils/ingredient-formatting'

	let {
		ingredients,
		servings,
		originalServings,
		unitSystem = 'imperial',
		loading = false
	}: {
		ingredients: Ingredient[]
		servings: number
		originalServings: number
		unitSystem?: UnitSystem
		loading?: boolean
	} = $props()

	let displayIngredients = $derived(
		ingredients.map((ingredient: Ingredient) =>
			getDisplayIngredient(ingredient, servings, originalServings, unitSystem)
		)
	)
</script>

<ul class="ingredients-list">
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
