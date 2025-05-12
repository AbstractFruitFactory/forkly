<script module lang="ts">
	const scaleIngredientQuantity = (
		ingredient: Ingredient,
		currentServings: number,
		originalServings: number
	) => {
		if (!ingredient.quantity) return ingredient
		return {
			...ingredient,
			quantity: ingredient.quantity * (currentServings / originalServings)
		}
	}
</script>

<script lang="ts">
	import type { Ingredient } from '$lib/types'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'

	let {
		ingredients,
		servings,
		originalServings,
		onServingsChange
	}: {
		ingredients: Ingredient[]
		servings: number
		originalServings: number
		onServingsChange?: (newServings: number) => void
	} = $props()

	let currentServings = $state(servings)

	let scaledIngredients = $derived(
		ingredients.map((ingredient: Ingredient) =>
			scaleIngredientQuantity(ingredient, currentServings, originalServings)
		)
	)

	const handleServingsChange = (newServings: number) => {
		currentServings = newServings
		if (onServingsChange) onServingsChange(newServings)
	}
</script>

<ul class="ingredients-list card">
	{#each scaledIngredients as ingredient}
		<li>
			{#if ingredient.quantity}
				<span class="quantity">
					{ingredient.quantity}
				</span>
				{#if ingredient.measurement}
					<span class="measurement">
						{ingredient.measurement}
					</span>
				{/if}
				<span class="ingredient-name">
					{ingredient.displayName}
				</span>
			{:else}
				<span class="ingredient-name">
					{ingredient.displayName}
				</span>
			{/if}
		</li>
	{/each}

	<ServingsAdjuster servings={currentServings} onServingsChange={handleServingsChange} />
</ul>

<style lang="scss">
	@import '$lib/global.scss';

	.ingredients-list {
		li {
			list-style: none;
			padding: var(--spacing-md) 0;
			border-bottom: 2px dotted rgba(255, 255, 255, 0.1);
			display: flex;
			font-size: var(--font-size-sm);
			width: 100%;

			&:nth-last-child(2),
			&:last-child {
				border-bottom: none;
			}
		}
	}

	.quantity,
	.measurement {
		margin-right: var(--spacing-sm);
		font-weight: var(--font-weight-semibold);
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
