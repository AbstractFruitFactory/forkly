<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import PillSelector from './PillSelector.svelte'

	const { Story } = defineMeta({
		component: PillSelector,
		title: 'lib/components/Pill Selector',
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
	{#snippet children(args)}
		<PillSelector items={dietItems} selectedItems={[]} name="diets" {...args} />
	{/snippet}
</Story>

<Story name="With Preselected Items">
	{#snippet children(args)}
		<PillSelector 
			items={dietItems} 
			selectedItems={['Vegetarian', 'Gluten-Free']} 
			name="diets" 
			{...args}
		/>
	{/snippet}
</Story>

<Story name="With Color Map">
	{#snippet children(args)}
		<PillSelector 
			items={dietItems} 
			selectedItems={['Vegetarian', 'Gluten-Free', 'Keto']} 
			name="diets" 
			colorMap={dietColorMap} 
			{...args}
		/>
	{/snippet}
</Story>

<Story name="Different Items">
	{#snippet children(args)}
		<PillSelector 
			items={cuisineItems} 
			selectedItems={['Italian', 'Japanese']} 
			name="cuisines" 
			{...args}
		/>
	{/snippet}
</Story>

<Story name="All Items Selected">
	{#snippet children(args)}
		<PillSelector 
			items={['Red', 'Green', 'Blue']} 
			selectedItems={['Red', 'Green', 'Blue']} 
			name="colors" 
			{...args}
		/>
	{/snippet}
</Story> 