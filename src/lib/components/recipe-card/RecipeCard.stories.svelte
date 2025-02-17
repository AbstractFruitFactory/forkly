<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import RecipeCard from './RecipeCard.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/RecipeCard',
		component: RecipeCard,
		tags: ['autodocs']
	})

	const mockRecipe = {
		id: '1',
		title: 'Classic Spaghetti Carbonara',
		description: 'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
		ingredients: 5,
		instructions: 4
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