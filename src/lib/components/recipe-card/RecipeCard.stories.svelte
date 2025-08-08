<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import RecipeCard from './RecipeCard.svelte'
	import type { MeasurementUnit } from '$lib/types'
	import type { DetailedRecipe } from '$lib/server/db/recipe'

	const { Story } = defineMeta({
		title: 'lib/components/RecipeCard',
		component: RecipeCard,
		tags: ['autodocs'],
		argTypes: {
			// @ts-expect-error
			title: {
				control: { type: 'text' },
				description: 'Recipe title'
			},
			tagCount: {
				control: { type: 'range', min: 0, max: 10, step: 1 },
				description: 'Number of tags to display'
			},
			ingredientCount: {
				control: { type: 'range', min: 0, max: 20, step: 1 },
				description: 'Number of ingredients to display'
			},
			instructionCount: {
				control: { type: 'range', min: 0, max: 15, step: 1 },
				description: 'Number of instructions to display'
			},
			likes: {
				control: { type: 'range', min: 0, max: 50000, step: 1 },
				description: 'Number of likes'
			}
		}
	})

	const baseRecipe: Partial<DetailedRecipe> = {
		id: '1',
		title: 'Classic Spaghetti Carbonara',
		description:
			'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
		imageUrl:
			'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=800&auto=format&fit=crop',
		bookmarks: 12,
		createdAt: new Date(),
		servings: 4,
		isLiked: false,
		isSaved: false,
		likes: 42,
		tags: ['Italian', 'Pasta'],
		instructions: [
			{ id: '1', text: 'Bring a large pot of salted water to boil', ingredients: [] },
			{ id: '2', text: 'Cook spaghetti according to package directions', ingredients: [] },
			{ id: '3', text: 'In a large skillet, cook pancetta until crispy', ingredients: [] },
			{ id: '4', text: 'Mix eggs and cheese, then combine with hot pasta', ingredients: [] }
		],
		ingredients: [
			{
				id: '1',
				name: 'Spaghetti',
				quantity: { text: '400', numeric: 400 },
				measurement: 'grams',
				displayName: '400g Spaghetti'
			},
			{
				id: '2',
				name: 'Eggs',
				quantity: { text: '4', numeric: 4 },
				measurement: 'pieces',
				displayName: '4 Eggs'
			},
			{
				id: '3',
				name: 'Parmesan Cheese',
				quantity: { text: '100', numeric: 100 },
				measurement: 'grams',
				displayName: '100g Parmesan Cheese'
			},
			{
				id: '4',
				name: 'Pancetta',
				quantity: { text: '150', numeric: 150 },
				measurement: 'grams',
				displayName: '150g Pancetta'
			},
			{
				id: '5',
				name: 'Black Pepper',
				quantity: { text: '1', numeric: 1 },
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
		}
	}

	function createMockRecipe(args: any): DetailedRecipe {
		const tagOptions = ['Italian', 'Pasta', 'Quick', 'Dinner', 'Vegetarian', 'Spicy', 'Healthy', 'Comfort', 'Traditional', 'Modern']
		const ingredientOptions = ['Pasta', 'Eggs', 'Cheese', 'Pancetta', 'Black Pepper', 'Olive Oil', 'Garlic', 'Onion', 'Tomatoes', 'Basil', 'Salt', 'Butter', 'Cream', 'Mushrooms', 'Spinach', 'Chicken', 'Beef', 'Fish', 'Shrimp', 'Bacon']
		const measurementUnits: MeasurementUnit[] = ['grams', 'kilograms', 'ounces', 'pounds', 'milliliters', 'liters', 'cups', 'fluid_ounces', 'teaspoons', 'tablespoons', 'pieces']
		
		return {
			...baseRecipe,
			title: args.title || 'Classic Spaghetti Carbonara',
			tags: tagOptions.slice(0, args.tagCount || 2),
			ingredients: Array.from({ length: args.ingredientCount || 5 }, (_, i) => {
				const quantity = Math.floor(Math.random() * 10) + 1
				const measurement = measurementUnits[Math.floor(Math.random() * measurementUnits.length)]
				return {
					id: `ingredient-${i}`,
					name: ingredientOptions[i % ingredientOptions.length],
					quantity: { text: quantity.toString(), numeric: quantity },
					measurement,
					displayName: `${quantity} ${measurement} ${ingredientOptions[i % ingredientOptions.length]}`
				}
			}),
			instructions: Array.from({ length: args.instructionCount || 4 }, (_, i) => ({
				id: `instruction-${i}`,
				text: `Step ${i + 1}: ${['Boil water', 'Cook pasta', 'Prepare sauce', 'Mix ingredients', 'Season to taste', 'Garnish and serve'][i % 6]}`,
				mediaUrl: undefined,
				mediaType: undefined,
				ingredients: []
			})),
			likes: args.likes || 42
		} as DetailedRecipe
	}
</script>

<Story name="Default">
	{#snippet children(args)}
		<RecipeCard recipe={createMockRecipe(args)} />
	{/snippet}
</Story>

<Story name="Without Description">
	{#snippet children(args)}
		<RecipeCard recipe={{ ...createMockRecipe(args), description: undefined }} />
	{/snippet}
</Story>

<Story name="Loading" args={{ recipe: undefined, loading: true }} />
