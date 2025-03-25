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
		description:
			'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
		ingredients: 5,
		instructions: 4,
		imageUrl:
			'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=800&auto=format&fit=crop',
		likes: 42,
		bookmarks: 12
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

<Story name="Loading" args={{ recipe: undefined, loading: true }} />
