<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import PillSelector from './PillSelector.svelte'

	const { Story } = defineMeta({
		component: PillSelector,
		tags: ['autodocs'],
		argTypes: {
			items: {},
			selectedItems: {},
			name: {
				control: 'text'
			},
			colorMap: {}
		}
	})

	const dietItems = [
		'Vegetarian',
		'Vegan',
		'Gluten-Free',
		'Dairy-Free',
		'Keto',
		'Paleo',
		'Low-Carb',
		'Low-Fat',
		'Pescatarian',
		'Mediterranean'
	]

	const dietColorMap = {
		'Vegetarian': '#10b981',
		'Vegan': '#059669',
		'Gluten-Free': '#6366f1',
		'Dairy-Free': '#8b5cf6',
		'Keto': '#ef4444',
		'Paleo': '#f59e0b',
		'Low-Carb': '#f97316',
		'Low-Fat': '#3b82f6',
		'Pescatarian': '#06b6d4',
		'Mediterranean': '#8b5cf6'
	}

	const cuisineItems = [
		'Italian',
		'Mexican',
		'Chinese',
		'Japanese',
		'Indian',
		'Thai',
		'French',
		'Greek',
		'Spanish',
		'American'
	]
</script>

<Story name="Empty">
	<PillSelector items={dietItems} selectedItems={[]} name="diets" />
</Story>

<Story name="With Preselected Items">
	<PillSelector 
		items={dietItems} 
		selectedItems={['Vegetarian', 'Gluten-Free']} 
		name="diets" 
	/>
</Story>

<Story name="With Color Map">
	<PillSelector 
		items={dietItems} 
		selectedItems={['Vegetarian', 'Gluten-Free', 'Keto']} 
		name="diets" 
		colorMap={dietColorMap} 
	/>
</Story>

<Story name="Different Items">
	<PillSelector 
		items={cuisineItems} 
		selectedItems={['Italian', 'Japanese']} 
		name="cuisines" 
	/>
</Story>

<Story name="All Items Selected">
	<PillSelector 
		items={['Red', 'Green', 'Blue']} 
		selectedItems={['Red', 'Green', 'Blue']} 
		name="colors" 
	/>
</Story> 