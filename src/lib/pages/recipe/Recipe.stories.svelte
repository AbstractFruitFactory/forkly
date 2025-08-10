<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Recipe from './Recipe.svelte'
	import type { MeasurementUnit } from '$lib/types'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import type { Component, ComponentProps } from 'svelte'
	import type { DetailedRecipe } from '$lib/server/db/recipe'

	type StoryProps = ComponentProps<typeof Recipe> & {
		hasUser: boolean
		hasImage: boolean
	}

	const { Story } = defineMeta<Component<StoryProps>>({
		component: Recipe,
		parameters: {
			layout: 'fullscreen',
			controls: {
				hideNoControlsWarning: true,
				include: ['hasUser', 'hasImage']
			}
		},
		args: {
			hasUser: true,
			hasImage: true
		},
		argTypes: {
			hasUser: {
				control: 'boolean',
				description: 'Toggle user presence'
			},
			hasImage: {
				control: 'boolean',
				description: 'Toggle recipe image'
			}
		}
	})

	const mockRecipe: DetailedRecipe = {
		isSaved: false,
		id: 'recipe-123',
		title: 'Classic Spaghetti Carbonara',
		description:
			'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper. Lorem ipsum dolor sit amet consectetur. Et enim nisi ac dui venenatis vitae egestas sit. Viverra vehicula odio quis convallis. Et libero mauris tincidunt volutpat ut ut posuere rhoncus. Condimentum risus egestas ultricies fermentum ullamcorper id varius dignissim feugiat.',
		servings: 4,
		ingredients: [
			{ id: '1', quantity: { text: '400', numeric: 400 }, measurement: 'grams' as MeasurementUnit, name: 'spaghetti', displayName: 'spaghetti' },
			{ id: '2', quantity: { text: '4', numeric: 4 }, measurement: 'pieces' as MeasurementUnit, name: 'large eggs', displayName: 'large eggs' },
			{
				id: '3',
				quantity: { text: '100', numeric: 100 },
				measurement: 'grams' as MeasurementUnit,
				name: 'pecorino romano',
				displayName: 'pecorino romano'
			},
			{ id: '4', quantity: { text: '200', numeric: 200 }, measurement: 'grams' as MeasurementUnit, name: 'pancetta', displayName: 'pancetta' },
			{
				id: '5',
				quantity: { text: '2', numeric: 2 },
				measurement: 'teaspoons' as MeasurementUnit,
				name: 'black pepper',
				displayName: 'black pepper'
			}
		],
		instructions: [
			{
				id: 'inst-1',
				text: 'Bring a large pot of salted water to boil and cook spaghetti according to package instructions.',
				mediaUrl: 'https://videos.pexels.com/video-files/3209831/3209831-uhd_2560_1440_25fps.mp4',
				mediaType: 'video' as const,
				ingredients: [
					{ id: '1', quantity: { text: '400', numeric: 400 }, measurement: 'grams' as MeasurementUnit, name: 'spaghetti', displayName: 'spaghetti', isPrepared: false }
				]
			},
			{
				id: 'inst-2',
				text: 'While pasta cooks, cut pancetta into small cubes and fry until crispy.',
				mediaUrl: 'https://videos.pexels.com/video-files/6603320/6603320-uhd_2560_1440_25fps.mp4',
				mediaType: 'video' as const,
				ingredients: [
					{ id: '4', quantity: { text: '200', numeric: 200 }, measurement: 'grams' as MeasurementUnit, name: 'pancetta', displayName: 'pancetta', isPrepared: false }
				]
			},
			{
				id: 'inst-3',
				text: 'In a bowl, whisk together eggs, grated pecorino romano, and black pepper.',
				mediaUrl: 'https://videos.pexels.com/video-files/7008568/7008568-hd_1920_1080_25fps.mp4',
				mediaType: 'video' as const,
				ingredients: [
					{ id: '2', quantity: { text: '4', numeric: 4 }, measurement: 'pieces' as MeasurementUnit, name: 'large eggs', displayName: 'large eggs', isPrepared: false },
					{ id: '3', quantity: { text: '100', numeric: 100 }, measurement: 'grams' as MeasurementUnit, name: 'pecorino romano', displayName: 'pecorino romano', isPrepared: false },
					{ id: '5', quantity: { text: '2', numeric: 2 }, measurement: 'teaspoons' as MeasurementUnit, name: 'black pepper', displayName: 'black pepper', isPrepared: false }
				]
			},
			{
				id: 'inst-4',
				text: 'Drain pasta, reserving some pasta water. While pasta is still very hot, quickly stir in the egg mixture and pancetta.',
				mediaUrl: 'https://videos.pexels.com/video-files/18775889/18775889-uhd_2560_1440_25fps.mp4',
				mediaType: 'video' as const,
				ingredients: []
			},
			{
				id: 'inst-5',
				text: 'Add pasta water as needed to create a creamy sauce. Serve immediately with extra cheese and black pepper.',
				mediaUrl: 'https://videos.pexels.com/video-files/30627970/13111089_1440_2560_25fps.mp4',
				mediaType: 'video' as const,
				ingredients: []
			}
		],
		likes: 42,
		bookmarks: 24,
		isLiked: false,
		imageUrl:
			'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80',
		userId: 'user-123',
		user: {
			username: 'ChefEmma',
			avatarUrl:
				'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'
		},
		tags: ['Vegan', 'Dinner', 'Sheet Pan'],
		createdAt: new Date('2024-01-01'),
		comments: 0,
		nutrition: {
			calories: 850,
			protein: 35,
			carbs: 80,
			fat: 40
		}
	}

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
		console.log('Like clicked')
	}

	const mockUnitSystem: UnitSystem = 'metric'
	const mockOnUnitChange = (system: UnitSystem) => console.log('Unit changed to', system)
</script>

<Story name="Default">
	{#snippet children(args)}
		<Recipe
			recipeData={Promise.resolve({
				recipe: {
					...mockRecipe,
					user: args.hasUser ? mockRecipe.user : undefined,
					userId: args.hasUser ? mockRecipe.userId : undefined,
					imageUrl: args.hasImage ? mockRecipe.imageUrl : undefined
				},
				comments: { comments: [], total: 0 },
				collections: ['Favorites', 'Italian', 'Quick Meals'],
				isLoggedIn: true
			})}
			unitSystem={mockUnitSystem}
			onUnitChange={mockOnUnitChange}
			onLike={mockOnLike}
			onCreateCollection={async (name: string) => console.log('Create collection:', name)}
			loadComments={async () => ({ comments: [], total: 0 })}
		/>
	{/snippet}
</Story>

<Story name="Without Description">
	{#snippet children(args)}
		<Recipe
			recipeData={Promise.resolve({
				recipe: { ...mockRecipe, description: undefined, imageUrl: args.hasImage ? mockRecipe.imageUrl : undefined },
				comments: { comments: [], total: 0 },
				collections: ['Favorites', 'Italian', 'Quick Meals'],
				isLoggedIn: true
			})}
			unitSystem={mockUnitSystem}
			onUnitChange={mockOnUnitChange}
			onLike={mockOnLike}
			onCreateCollection={async (name: string) => console.log('Create collection:', name)}
			loadComments={async () => ({ comments: [], total: 0 })}
		/>
	{/snippet}
</Story>

<Story name="Without Login">
	{#snippet children(args)}
		<Recipe
			recipeData={Promise.resolve({
				recipe: { ...mockRecipe, imageUrl: args.hasImage ? mockRecipe.imageUrl : undefined },
				comments: { comments: [], total: 0 },
				collections: [],
				isLoggedIn: false
			})}
			unitSystem={mockUnitSystem}
			onUnitChange={mockOnUnitChange}
			onLike={mockOnLike}
			onCreateCollection={async (name: string) => console.log('Create collection:', name)}
			loadComments={async () => ({ comments: [], total: 0 })}
		/>
	{/snippet}
</Story>
