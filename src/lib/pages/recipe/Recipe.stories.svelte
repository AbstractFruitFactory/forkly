<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Recipe from './Recipe.svelte'
	import type { MeasurementUnit } from '$lib/types'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'

	const { Story } = defineMeta({
		component: Recipe,
		parameters: {
			layout: 'fullscreen'
		}
	})

	const mockRecipe = $state({
		id: 'recipe-123',
		title: 'Classic Spaghetti Carbonara',
		description:
			'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
		ingredients: [
			{ quantity: 400, measurement: 'grams' as MeasurementUnit, name: 'spaghetti', custom: false },
			{ quantity: 4, measurement: 'pieces' as MeasurementUnit, name: 'large eggs', custom: false },
			{
				quantity: 100,
				measurement: 'grams' as MeasurementUnit,
				name: 'pecorino romano',
				custom: false
			},
			{ quantity: 200, measurement: 'grams' as MeasurementUnit, name: 'pancetta', custom: false },
			{
				quantity: 2,
				measurement: 'teaspoons' as MeasurementUnit,
				name: 'black pepper',
				custom: false
			}
		],
		instructions: [
			{ text: 'Bring a large pot of salted water to boil and cook spaghetti according to package instructions.' },
			{ text: 'While pasta cooks, cut pancetta into small cubes and fry until crispy.' },
			{ text: 'In a bowl, whisk together eggs, grated pecorino romano, and black pepper.' },
			{ text: 'Drain pasta, reserving some pasta water. While pasta is still very hot, quickly stir in the egg mixture and pancetta.' },
			{ text: 'Add pasta water as needed to create a creamy sauce. Serve immediately with extra cheese and black pepper.' }
		],
		likes: 42,
		bookmarks: 24,
		isLiked: false
	})

	const mockNutrition = {
		totalNutrition: {
			calories: 850,
			protein: 35,
			carbs: 80,
			fat: 40
		},
		hasCustomIngredients: false
	}

	const mockOnLike = () => {
		mockRecipe.likes = mockRecipe.likes + (mockRecipe.isLiked ? -1 : 1)
		mockRecipe.isLiked = !mockRecipe.isLiked
	}

	const mockUnitSystem: UnitSystem = 'metric'
	const mockOnUnitChange = (system: UnitSystem) => console.log('Unit changed to', system)
</script>

<Story name="Default">
	{#snippet children(args)}
		<Recipe
			recipe={mockRecipe}
			nutrition={mockNutrition}
			unitSystem={mockUnitSystem}
			onUnitChange={mockOnUnitChange}
			isLoggedIn={true}
			onLike={mockOnLike}
			{...args}
		/>
	{/snippet}
</Story>

<Story name="Without Description">
	{#snippet children(args)}
		<Recipe
			recipe={{
				...mockRecipe,
				description: undefined
			}}
			nutrition={mockNutrition}
			unitSystem={mockUnitSystem}
			onUnitChange={mockOnUnitChange}
			isLoggedIn={true}
			onLike={mockOnLike}
			{...args}
		/>
	{/snippet}
</Story>

<Story name="Without Login">
	{#snippet children(args)}
		<Recipe
			recipe={mockRecipe}
			nutrition={mockNutrition}
			unitSystem={mockUnitSystem}
			onUnitChange={mockOnUnitChange}
			onLike={mockOnLike}
			isLoggedIn={false}
			{...args}
		/>
	{/snippet}
</Story>
