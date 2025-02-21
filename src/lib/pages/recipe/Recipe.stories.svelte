<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Recipe from './Recipe.svelte'

	const { Story } = defineMeta({
		component: Recipe,
		parameters: {
			layout: 'fullscreen'
		}
	})

	const mockRecipe = {
		title: 'Classic Spaghetti Carbonara',
		description: 'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
		ingredients: [
			{ quantity: 400, measurement: 'g', name: 'spaghetti', custom: false },
			{ quantity: 4, measurement: 'pieces', name: 'large eggs', custom: false },
			{ quantity: 100, measurement: 'g', name: 'pecorino romano', custom: false },
			{ quantity: 200, measurement: 'g', name: 'pancetta', custom: false },
			{ quantity: 2, measurement: 'tsp', name: 'black pepper', custom: false }
		],
		instructions: [
			'Bring a large pot of salted water to boil and cook spaghetti according to package instructions.',
			'While pasta cooks, cut pancetta into small cubes and fry until crispy.',
			'In a bowl, whisk together eggs, grated pecorino romano, and black pepper.',
			'Drain pasta, reserving some pasta water. While pasta is still very hot, quickly stir in the egg mixture and pancetta.',
			'Add pasta water as needed to create a creamy sauce. Serve immediately with extra cheese and black pepper.'
		]
	}
</script>

<Story name="Default" args={{ recipe: mockRecipe }} />

<Story 
	name="Without Description" 
	args={{ 
		recipe: {
			...mockRecipe,
			description: undefined
		}
	}} 
/> 