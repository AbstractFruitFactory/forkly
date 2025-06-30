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
       import Skeleton from '$lib/components/skeleton/Skeleton.svelte'
       import type { UnitSystem } from '$lib/state/unitPreference.svelte'
       import { convertMeasurement, formatMeasurement } from '$lib/utils/unitConversion'

       let {
               ingredients,
               servings,
               originalServings,
               onServingsChange,
               unitSystem = 'imperial',
               loading = false
       }: {
               ingredients: Ingredient[]
               servings: number
               originalServings: number
               onServingsChange?: (newServings: number) => void
               unitSystem?: UnitSystem
               loading?: boolean
       } = $props()

	let currentServings = $state(servings)

       let scaledIngredients = $derived(
               ingredients.map((ingredient: Ingredient) =>
                       scaleIngredientQuantity(ingredient, currentServings, originalServings)
               )
       )

       let displayIngredients = $derived(
               scaledIngredients.map((ingredient: Ingredient) => {
                       if (ingredient.quantity && ingredient.measurement) {
                               const { quantity, unit } = convertMeasurement(
                                       ingredient.quantity,
                                       ingredient.measurement,
                                       unitSystem
                               )
                               return {
                                       ...ingredient,
                                       displayMeasurement: formatMeasurement(quantity, unit)
                               }
                       }
                       return { ...ingredient, displayMeasurement: undefined }
               })
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
               {#each displayIngredients as ingredient}
                       <li>
                               {#if ingredient.displayMeasurement}
                                       <span class="measurement">{ingredient.displayMeasurement}</span>
                               {/if}
                               <span class="ingredient-name">{ingredient.displayName}</span>
                       </li>
               {/each}
       {/if}

	{#if !loading}
		<div style:margin-top="var(--spacing-sm)">
			<ServingsAdjuster servings={currentServings} onServingsChange={handleServingsChange} />
		</div>
	{/if}
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
