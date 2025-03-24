<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import NutritionFacts from './NutritionFacts.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Nutrition Facts',
		component: NutritionFacts,
		tags: ['autodocs']
	})

	const mockNutrition = {
		totalNutrition: {
			calories: 450,
			protein: 30,
			carbs: 45,
			fat: 15
		},
		hasCustomIngredients: false
	}

	const highCalorieMock = {
		totalNutrition: {
			calories: 850,
			protein: 45,
			carbs: 80,
			fat: 35
		},
		hasCustomIngredients: false
	}

	const lowCalorieMock = {
		totalNutrition: {
			calories: 180,
			protein: 12,
			carbs: 20,
			fat: 6
		},
		hasCustomIngredients: true
	}
</script>

<Story name="Default">
	{#snippet children(args)}
		<div style="width: 600px; padding: 20px; background-color: #1a1a1a;">
			<NutritionFacts nutrition={mockNutrition} {...args} />
		</div>
	{/snippet}
</Story>

<Story name="High Calorie">
	{#snippet children(args)}
		<div style="width: 600px; padding: 20px; background-color: #1a1a1a;">
			<NutritionFacts nutrition={highCalorieMock} {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Low Calorie">
	{#snippet children(args)}
		<div style="width: 600px; padding: 20px; background-color: #1a1a1a;">
			<NutritionFacts nutrition={lowCalorieMock} {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Mobile View">
	{#snippet children(args)}
		<div style="width: 320px; padding: 20px; background-color: #1a1a1a;">
			<NutritionFacts nutrition={mockNutrition} {...args} />
		</div>
	{/snippet}
</Story> 