<script lang="ts">
	import FilterSelector from './FilterSelector.svelte'
	import type { Meta, StoryObj } from '@storybook/svelte'

	const meta = {
		title: 'Components/FilterSelector',
		component: FilterSelector,
		tags: ['autodocs'],
		argTypes: {
			items: { control: 'array' },
			selectedItems: { control: 'array' },
			name: { control: 'text' },
			label: { control: 'text' },
			allowCustomItems: { control: 'boolean' }
		}
	} satisfies Meta<FilterSelector>

	export default meta
	type Story = StoryObj<typeof meta>

	const dietItems = [
		'Vegetarian',
		'Vegan',
		'Pescatarian',
		'Gluten-Free',
		'Dairy-Free',
		'Keto',
		'Paleo',
		'Low-Carb',
		'High-Protein'
	]

	export const Default: Story = {
		args: {
			items: dietItems,
			selectedItems: [],
			name: 'diets'
		}
	}

	export const WithLabel: Story = {
		args: {
			items: dietItems,
			selectedItems: [],
			name: 'diets',
			label: 'Select Diet'
		}
	}

	export const WithSelectedItems: Story = {
		args: {
			items: dietItems,
			selectedItems: ['Vegetarian', 'Gluten-Free'],
			name: 'diets'
		}
	}

	export const WithCustomItems: Story = {
		args: {
			items: dietItems,
			selectedItems: [],
			name: 'diets',
			allowCustomItems: true
		}
	}

	export const WithColorMap: Story = {
		args: {
			items: dietItems,
			selectedItems: [],
			name: 'diets',
			colorMap: {
				'Vegetarian': '#4CAF50',
				'Vegan': '#8BC34A',
				'Pescatarian': '#2196F3',
				'Gluten-Free': '#FF9800',
				'Dairy-Free': '#F44336',
				'Keto': '#9C27B0',
				'Paleo': '#795548',
				'Low-Carb': '#607D8B',
				'High-Protein': '#E91E63'
			}
		}
	}
</script> 