<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import IngredientsList from './IngredientsList.svelte'
	import type { Ingredient } from '$lib/types'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte.ts'

	const { Story } = defineMeta({
		title: 'lib/components/Ingredients List',
		component: IngredientsList,
		tags: ['autodocs']
	})

	const mockIngredients: Ingredient[] = [
		{
			name: 'Chicken breast',
			measurement: 'pounds',
			quantity: 2,
			custom: false
		},
		{
			name: 'Olive oil',
			measurement: 'tablespoons',
			quantity: 2,
			custom: false
		},
		{
			name: 'Garlic',
			measurement: 'pieces',
			quantity: 3,
			custom: false
		},
		{
			name: 'Salt',
			measurement: 'to taste',
			quantity: 0,
			custom: false
		},
		{
			name: 'My special seasoning',
			measurement: 'tablespoons',
			quantity: 1,
			custom: true
		}
	]

	// Mock formatter function
	const getFormattedIngredient = (ingredient: Ingredient, unitSystem: UnitSystem) => {
		// This is a simplified version
		return {
			formattedMeasurement: unitSystem === 'metric' && ingredient.measurement !== 'to taste' && ingredient.measurement !== 'pinch'
				? convertToMetric(ingredient)
				: formatMeasurement(ingredient)
		}
	}

	// Simple conversion function for demo purposes
	function convertToMetric(ingredient: Ingredient): string {
		if (ingredient.measurement === 'pounds') {
			return `${(ingredient.quantity * 0.453).toFixed(1)} kg`
		}
		if (ingredient.measurement === 'ounces') {
			return `${(ingredient.quantity * 28.35).toFixed(0)} g`
		}
		return formatMeasurement(ingredient)
	}

	function formatMeasurement(ingredient: Ingredient): string {
		if (ingredient.measurement === 'to taste' || ingredient.measurement === 'pinch') {
			return ingredient.measurement
		}
		return `${ingredient.quantity} ${formatUnit(ingredient.measurement)}`
	}

	function formatUnit(unit: string): string {
		// Simple unit formatting
		if (unit === 'pieces') return 'cloves'
		if (unit === 'tablespoons') return 'tbsp'
		if (unit === 'teaspoons') return 'tsp'
		if (unit === 'pounds') return 'lb'
		return unit
	}
</script>

<Story name="US Units">
	{#snippet children(args)}
		<div style="width: 400px; padding: 20px; background-color: #1a1a1a;">
			<IngredientsList
				ingredients={mockIngredients}
				unitSystem="imperial"
				getFormattedIngredient={getFormattedIngredient}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Metric Units">
	{#snippet children(args)}
		<div style="width: 400px; padding: 20px; background-color: #1a1a1a;">
			<IngredientsList
				ingredients={mockIngredients}
				unitSystem="metric"
				getFormattedIngredient={getFormattedIngredient}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Empty List">
	{#snippet children(args)}
		<div style="width: 400px; padding: 20px; background-color: #1a1a1a;">
			<IngredientsList
				ingredients={[]}
				unitSystem="imperial"
				getFormattedIngredient={getFormattedIngredient}
				{...args}
			/>
		</div>
	{/snippet}
</Story> 