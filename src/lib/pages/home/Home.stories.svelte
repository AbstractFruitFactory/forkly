<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Home from './Home.svelte'

	const { Story } = defineMeta({
		title: 'Pages/Home',
		component: Home,
		parameters: {
			layout: 'fullscreen'
		}
	})

	const mockRecipes = [
		{
			id: 1,
			title: 'Classic Spaghetti Carbonara',
			description: 'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
			ingredients: ['spaghetti', 'eggs', 'pecorino romano', 'pancetta', 'black pepper'],
			instructions: ['Boil pasta', 'Cook pancetta', 'Mix eggs and cheese', 'Combine all ingredients']
		},
		{
			id: 2,
			title: 'Chicken Tikka Masala',
			description: 'Grilled chicken chunks in a creamy spiced curry sauce.',
			ingredients: ['chicken', 'yogurt', 'tomatoes', 'cream', 'spices'],
			instructions: ['Marinate chicken', 'Grill chicken', 'Prepare sauce', 'Combine and simmer']
		}
	]
</script>

<Story name="Empty" args={{ recipes: [] }} />

<Story name="With Recipes" args={{ recipes: mockRecipes }} /> 