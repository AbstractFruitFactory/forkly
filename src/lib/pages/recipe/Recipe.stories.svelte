<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Recipe from './Recipe.svelte'
	import type { MeasurementUnit } from '$lib/types'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'

	const { Story } = defineMeta({
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

	const mockRecipe = $state({
		id: 'recipe-123',
		title: 'Classic Spaghetti Carbonara',
		description:
			'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
		ingredients: [
			{ quantity: 400, measurement: 'grams' as MeasurementUnit, name: 'spaghetti', custom: false },
			{ quantity: 4, measurement: 'pieces' as MeasurementUnit, name: 'large eggs', custom: false },
			{
				quantity: 100,
				measurement: 'grams' as MeasurementUnit,
				name: 'pecorino romano',
				custom: false
			},
			{ quantity: 200, measurement: 'grams' as MeasurementUnit, name: 'pancetta', custom: false },
			{
				quantity: 2,
				measurement: 'teaspoons' as MeasurementUnit,
				name: 'black pepper',
				custom: false
			}
		],
		instructions: [
			{
				text: 'Bring a large pot of salted water to boil and cook spaghetti according to package instructions.',
				mediaUrl: 'https://videos.pexels.com/video-files/3209831/3209831-uhd_2560_1440_25fps.mp4',
				mediaType: 'video' as const
			},
			{
				text: 'While pasta cooks, cut pancetta into small cubes and fry until crispy.',
				mediaUrl: 'https://videos.pexels.com/video-files/6603320/6603320-uhd_2560_1440_25fps.mp4',
				mediaType: 'video' as const
			},
			{
				text: 'In a bowl, whisk together eggs, grated pecorino romano, and black pepper.',
				mediaUrl: 'https://videos.pexels.com/video-files/7008568/7008568-hd_1920_1080_25fps.mp4',
				mediaType: 'video' as const
			},
			{
				text: 'Drain pasta, reserving some pasta water. While pasta is still very hot, quickly stir in the egg mixture and pancetta.',
				mediaUrl: 'https://videos.pexels.com/video-files/18775889/18775889-uhd_2560_1440_25fps.mp4',
				mediaType: 'video' as const
			},
			{
				text: 'Add pasta water as needed to create a creamy sauce. Serve immediately with extra cheese and black pepper.',
				mediaUrl: 'https://videos.pexels.com/video-files/30627970/13111089_1440_2560_25fps.mp4',
				mediaType: 'video' as const
			}
		],
		likes: 42,
		dislikes: 12,
		bookmarks: 24,
		isLiked: false,
		imageUrl:
			'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80',
		userId: 'user-123',
		user: {
			username: 'ChefEmma',
			avatarUrl:
				'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'
		}
	})

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
		mockRecipe.likes = mockRecipe.likes + (mockRecipe.isLiked ? -1 : 1)
		mockRecipe.isLiked = !mockRecipe.isLiked
	}

	const mockUnitSystem: UnitSystem = 'metric'
	const mockOnUnitChange = (system: UnitSystem) => console.log('Unit changed to', system)
</script>

<Story name="Default">
	{#snippet children(args)}
		<Recipe
			recipe={{
				...mockRecipe,
				user: args.hasUser ? mockRecipe.user : undefined,
				userId: args.hasUser ? mockRecipe.userId : undefined,
				imageUrl: args.hasImage ? mockRecipe.imageUrl : undefined
			}}
			nutrition={mockNutrition}
			unitSystem={mockUnitSystem}
			onUnitChange={mockOnUnitChange}
			isLoggedIn={args.hasUser}
			onLike={mockOnLike}
		/>
	{/snippet}
</Story>

<Story name="Without Description">
	{#snippet children(args)}
		<Recipe
			recipe={{
				...mockRecipe,
				description: undefined,
				imageUrl: args.hasImage ? mockRecipe.imageUrl : undefined
			}}
			nutrition={mockNutrition}
			unitSystem={mockUnitSystem}
			onUnitChange={mockOnUnitChange}
			isLoggedIn={true}
			onLike={mockOnLike}
		/>
	{/snippet}
</Story>

<Story name="Without Login">
	{#snippet children(args)}
		<Recipe
			recipe={{
				...mockRecipe,
				imageUrl: args.hasImage ? mockRecipe.imageUrl : undefined
			}}
			nutrition={mockNutrition}
			unitSystem={mockUnitSystem}
			onUnitChange={mockOnUnitChange}
			onLike={mockOnLike}
			isLoggedIn={false}
		/>
	{/snippet}
</Story>
