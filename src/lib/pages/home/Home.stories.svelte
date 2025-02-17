<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Home from './Home.svelte'

	const { Story } = defineMeta({
		component: Home,
		parameters: {
			layout: 'fullscreen'
		}
	})

	const mockRecipes = [
		{
			id: '1',
			title: 'Classic Spaghetti Carbonara',
			description: 'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
			ingredients: 5,
			instructions: 4
		},
		{
			id: '2',
			title: 'Chicken Tikka Masala',
			description: 'Grilled chicken chunks in a creamy spiced curry sauce.',
			ingredients: 5,
			instructions: 4
		}
	]
</script>

<Story name="Empty" args={{ recipes: [] }} />

<Story name="With Recipes" args={{ recipes: mockRecipes }} /> 