<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import RecipeCard from './RecipeCard.svelte'
	import type { MeasurementUnit } from '$lib/types'

	const { Story } = defineMeta({
		title: 'lib/components/RecipeCard',
		component: RecipeCard,
		tags: ['autodocs'],
		argTypes: {
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
				control: { type: 'range', min: 0, max: 1000, step: 1 },
				description: 'Number of likes'
			}
		}
	})

	const baseRecipe = {
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
		isSaved: false
	}

	function createMockRecipe(args: any) {
		const tagOptions = ['Italian', 'Pasta', 'Quick', 'Dinner', 'Vegetarian', 'Spicy', 'Healthy', 'Comfort', 'Traditional', 'Modern']
		const ingredientOptions = ['Pasta', 'Eggs', 'Cheese', 'Pancetta', 'Black Pepper', 'Olive Oil', 'Garlic', 'Onion', 'Tomatoes', 'Basil', 'Salt', 'Butter', 'Cream', 'Mushrooms', 'Spinach', 'Chicken', 'Beef', 'Fish', 'Shrimp', 'Bacon']
		const measurementUnits: MeasurementUnit[] = ['grams', 'kilograms', 'ounces', 'pounds', 'milliliters', 'liters', 'cups', 'fluid_ounces', 'teaspoons', 'tablespoons', 'pieces', 'to taste', 'pinch']
		
		return {
			...baseRecipe,
			title: args.title || 'Classic Spaghetti Carbonara',
			tags: tagOptions.slice(0, args.tagCount || 2),
			ingredients: Array.from({ length: args.ingredientCount || 5 }, (_, i) => ({
				id: `ingredient-${i}`,
				name: ingredientOptions[i % ingredientOptions.length],
				quantity: Math.floor(Math.random() * 10) + 1,
				measurement: measurementUnits[Math.floor(Math.random() * measurementUnits.length)],
				displayName: `${ingredientOptions[i % ingredientOptions.length]} ${Math.floor(Math.random() * 10) + 1}${measurementUnits[Math.floor(Math.random() * measurementUnits.length)]}`
			})),
			instructions: Array.from({ length: args.instructionCount || 4 }, (_, i) => ({
				text: `Step ${i + 1}: ${['Boil water', 'Cook pasta', 'Prepare sauce', 'Mix ingredients', 'Season to taste', 'Garnish and serve'][i % 6]}`,
				mediaUrl: undefined,
				mediaType: undefined
			})),
			likes: args.likes || 42
		}
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
