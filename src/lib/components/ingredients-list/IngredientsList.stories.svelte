<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import IngredientsList from './IngredientsList.svelte'
	import type { Ingredient } from '$lib/types'

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
			displayName: 'Chicken breast'
		},
		{
			name: 'Olive oil',
			measurement: 'tablespoons',
			quantity: 2,
			displayName: 'Olive oil'
		},
		{
			name: 'Garlic',
			measurement: 'pieces',
			quantity: 3,
			displayName: 'Garlic'
		},
		{
			name: 'Salt',
			measurement: 'to taste',
			quantity: 0,
			displayName: 'Salt'
		},
		{
			name: 'My special seasoning',
			measurement: 'tablespoons',
			quantity: 1,
			displayName: 'My special seasoning'
		}
	]

	let currentServings = $state(4)

	const onServingsChange = (newServings: number) => {
		currentServings = newServings
	}
</script>

<Story name="US Units">
	{#snippet children(args)}
		<div style="width: 400px; padding: 20px; background-color: #1a1a1a;">
			<IngredientsList
				ingredients={mockIngredients}
				unitSystem="imperial"
				{currentServings}
				{onServingsChange}
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
				{currentServings}
				{onServingsChange}
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
				{currentServings}
				{onServingsChange}
				{...args}
			/>
		</div>
	{/snippet}
</Story>
