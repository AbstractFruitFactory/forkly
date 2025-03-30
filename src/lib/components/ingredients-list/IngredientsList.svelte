<script lang="ts">
	import type { Ingredient } from '$lib/types'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import { getFormattedIngredient } from '$lib/pages/recipe/utils/recipeUtils'

	let {
		ingredients,
		unitSystem
	}: {
		ingredients: Ingredient[]
		unitSystem: UnitSystem
	} = $props()
</script>

<ul class="ingredients-list">
	{#each ingredients as ingredient}
		{@const formattedIngredient = getFormattedIngredient(ingredient, unitSystem)}
		<li>
			<span class="measurement">
				{#if ingredient.measurement === 'to taste' || ingredient.measurement === 'pinch'}
					{ingredient.measurement}
				{:else}
					{formattedIngredient.formattedMeasurement}
				{/if}
			</span>
			<span class="ingredient-name">
				{ingredient.name}
				{#if ingredient.custom}
					<span class="custom-badge">custom</span>
				{/if}
			</span>
		</li>
	{/each}
</ul>

<style lang="scss">
	@import '$lib/global.scss';

	.ingredients-list {
		margin: 0;
		padding: 0;

		li {
			list-style: none;
			padding: var(--spacing-xs) 0;
			border-bottom: 2px dotted rgba(255, 255, 255, 0.1);
			display: flex;
			font-size: var(--font-size-sm);
			width: 100%;

			&:last-child {
				border-bottom: none;
			}
		}
	}

	.measurement {
		margin-right: var(--spacing-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary);
		min-width: 50px;

		@include tablet {
			min-width: 60px;
		}
	}

	.ingredient-name {
		color: var(--color-neutral-lightest);
	}

	.custom-badge {
		font-size: var(--font-size-xs);
		background: var(--color-primary-light);
		color: var(--color-neutral-darkest);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-md);
		margin-left: var(--spacing-sm);
		vertical-align: middle;
		font-weight: var(--font-weight-semibold);
	}
</style>
