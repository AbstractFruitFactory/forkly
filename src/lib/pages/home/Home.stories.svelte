<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Home from './Home.svelte'
	import type { DetailedRecipe } from '$lib/server/db/recipe'

	const { Story } = defineMeta({
		title: 'lib/pages/Home',
		component: Home,
		parameters: {
			layout: 'fullscreen'
		}
	})

	const mockRecipes: DetailedRecipe[] = [
		{
			id: '1',
			title: 'Classic Spaghetti Carbonara',
			description: 'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
			instructions: [
				{ text: 'Bring a large pot of salted water to boil' },
				{ text: 'Cook spaghetti according to package directions' },
				{ text: 'In a large skillet, cook pancetta until crispy' },
				{ text: 'Mix eggs and cheese, then combine with hot pasta' }
			],
			tags: ['Italian', 'Pasta', 'Quick'],
			imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=800&auto=format&fit=crop',
			createdAt: new Date(),
			likes: 42,
			bookmarks: 24,
			servings: 4,
			ingredients: [
				{
					id: '1',
					name: 'Spaghetti',
					quantity: 400,
					measurement: 'grams',
					displayName: '400g Spaghetti'
				},
				{
					id: '2',
					name: 'Eggs',
					quantity: 4,
					measurement: 'pieces',
					displayName: '4 Eggs'
				},
				{
					id: '3',
					name: 'Parmesan Cheese',
					quantity: 100,
					measurement: 'grams',
					displayName: '100g Parmesan Cheese'
				},
				{
					id: '4',
					name: 'Pancetta',
					quantity: 150,
					measurement: 'grams',
					displayName: '150g Pancetta'
				},
				{
					id: '5',
					name: 'Black Pepper',
					quantity: 1,
					measurement: 'teaspoons',
					displayName: '1 tsp Black Pepper'
				}
			],
			nutrition: {
				calories: 650,
				protein: 25,
				carbs: 75,
				fat: 30
			},
			user: {
				username: 'pasta_lover',
				avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
			},
			isLiked: false,
			isSaved: false
		},
		{
			id: '2',
			title: 'Chicken Tikka Masala',
			description: 'Grilled chicken chunks in a creamy spiced curry sauce.',
			instructions: [
				{ text: 'Marinate chicken in yogurt and spices for 30 minutes' },
				{ text: 'Grill chicken until charred and cooked through' },
				{ text: 'Prepare creamy tomato sauce with spices' },
				{ text: 'Combine chicken with sauce and simmer' }
			],
			tags: ['Indian', 'Curry', 'Chicken'],
			imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop',
			createdAt: new Date(),
			likes: 37,
			bookmarks: 18,
			servings: 6,
			ingredients: [
				{
					id: '6',
					name: 'Chicken Breast',
					quantity: 600,
					measurement: 'grams',
					displayName: '600g Chicken Breast'
				},
				{
					id: '7',
					name: 'Yogurt',
					quantity: 200,
					measurement: 'milliliters',
					displayName: '200ml Yogurt'
				},
				{
					id: '8',
					name: 'Tomato Sauce',
					quantity: 400,
					measurement: 'milliliters',
					displayName: '400ml Tomato Sauce'
				},
				{
					id: '9',
					name: 'Heavy Cream',
					quantity: 200,
					measurement: 'milliliters',
					displayName: '200ml Heavy Cream'
				},
				{
					id: '10',
					name: 'Garam Masala',
					quantity: 2,
					measurement: 'teaspoons',
					displayName: '2 tsp Garam Masala'
				}
			],
			nutrition: {
				calories: 450,
				protein: 35,
				carbs: 15,
				fat: 25
			},
			user: {
				username: 'spice_master',
				avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
			},
			isLiked: false,
			isSaved: false
		}
	]
</script>

<Story name="Empty">
	{#snippet children(args)}
		<Home recipes={Promise.resolve([])} {...args} />
	{/snippet}
</Story>

<Story name="With Recipes">
	{#snippet children(args)}
		<Home recipes={Promise.resolve(mockRecipes)} {...args} />
	{/snippet}
</Story> 