<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Home from './Home.svelte'

	const { Story } = defineMeta({
		title: 'lib/pages/Home',
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
			instructions: 4,
			likes: 42,
			bookmarks: 24,
			createdAt: new Date().toISOString(),
			user: {
				username: 'pasta_lover'
			}
		},
		{
			id: '2',
			title: 'Chicken Tikka Masala',
			description: 'Grilled chicken chunks in a creamy spiced curry sauce.',
			ingredients: 5,
			instructions: 4,
			likes: 37,
			bookmarks: 18,
			createdAt: new Date().toISOString(),
			user: {
				username: 'spice_master'
			}
		}
	]
</script>

<Story name="Empty">
	{#snippet children(args)}
		<Home recipes={[]} {...args} />
	{/snippet}
</Story>

<Story name="With Recipes">
	{#snippet children(args)}
		<Home recipes={mockRecipes} {...args} />
	{/snippet}
</Story> 