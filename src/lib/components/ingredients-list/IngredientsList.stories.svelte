<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import IngredientsList from './IngredientsList.svelte'
	import type { Component, ComponentProps } from 'svelte'
	import type { Ingredient } from '$lib/types'

	const { Story } = defineMeta<Component<ComponentProps<typeof IngredientsList>>>({
		title: 'lib/components/Ingredients List',
		component: IngredientsList,
		tags: ['autodocs'],
		argTypes: {
			ingredients: {
				control: 'object',
				defaultValue: [
					{
						name: 'Chicken breast',
						measurement: 'pounds',
						quantity: { text: '2', numeric: 2 },
						displayName: 'Chicken breast'
					},
					{
						name: 'Olive oil',
						measurement: 'tablespoons',
						quantity: { text: '2', numeric: 2 },
						displayName: 'Olive oil'
					},
					{
						name: 'Garlic',
						measurement: 'pieces',
						quantity: { text: '3', numeric: 3 },
						displayName: 'Garlic'
					},
					{
						name: 'Salt',
						quantity: { text: 'to taste' },
						displayName: 'Salt'
					},
					{
						name: 'My special seasoning',
						measurement: 'tablespoons',
						quantity: { text: '1', numeric: 1 },
						displayName: 'My special seasoning'
					}
				],
				name: 'ingredients'
			},
			servings: {
				control: 'number',
				defaultValue: 4,
				name: 'current servings'
			},
			originalServings: {
				control: 'number',
				defaultValue: 4,
				name: 'original servings'
			},
			unitSystem: {
				control: 'select',
				options: ['imperial', 'metric'],
				defaultValue: 'imperial',
				name: 'unit system'
			},
			loading: {
				control: 'boolean',
				defaultValue: false,
				name: 'loading state'
			}
		}
	})

	const mockIngredients: Ingredient[] = [
		{
			name: 'Chicken breast',
			measurement: 'pounds',
			quantity: { text: '2', numeric: 2 },
			displayName: 'Chicken breast'
		},
		{
			name: 'Olive oil',
			measurement: 'tablespoons',
			quantity: { text: '2', numeric: 2 },
			displayName: 'Olive oil'
		},
		{
			name: 'Garlic',
			measurement: 'pieces',
			quantity: { text: '3', numeric: 3 },
			displayName: 'Garlic'
		},
		{
			name: 'Salt',
			quantity: { text: 'to taste' },
			displayName: 'Salt'
		},
		{
			name: 'My special seasoning',
			measurement: 'tablespoons',
			quantity: { text: '1', numeric: 1 },
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
		<div style="width: 400px; padding: 20px; ">
			<IngredientsList
				ingredients={mockIngredients}
				unitSystem="imperial"
				servings={currentServings}
				originalServings={4}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Metric Units">
	{#snippet children(args)}
		<div style="width: 400px; padding: 20px; ">
			<IngredientsList
				ingredients={mockIngredients}
				unitSystem="metric"
				servings={currentServings}
				originalServings={4}
				{...args}
			/>
		</div>
	{/snippet}
</Story>