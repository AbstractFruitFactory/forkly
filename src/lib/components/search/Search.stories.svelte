<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Search from './Search.svelte'
	import type { Component, ComponentProps } from 'svelte'

	const { Story } = defineMeta<Component<ComponentProps<typeof Search>>>({
		component: Search,
		tags: ['autodocs']
	})

	const mockSuggestions = [
		{ name: 'Spaghetti Carbonara' },
		{ name: 'Chicken Parmesan' },
		{ name: 'Beef Stir Fry' },
		{ name: 'Vegetable Curry' },
		{ name: 'Caesar Salad' }
	]
</script>

<Story name="Empty">
	<div style="width: 300px; padding: 20px;">
		<Search
			placeholder="Search recipes..."
			isLoading={false}
			onSearch={(query) => []}
			onSelect={(suggestion) => console.log('Selected:', suggestion)}
		/>
	</div>
</Story>

<Story name="Loading">
	<div style="width: 300px; padding: 20px;">
		<Search
			placeholder="Search recipes..."
			isLoading={true}
			onSearch={(query) => []}
			onSelect={(suggestion) => console.log('Selected:', suggestion)}
		/>
	</div>
</Story>

<Story name="With Suggestions">
	<div style="width: 300px; padding: 20px;">
		<Search
			placeholder="Search recipes..."
			isLoading={false}
			onSearch={(query) => mockSuggestions}
			onSelect={(suggestion) => console.log('Selected:', suggestion)}
		/>
	</div>
</Story>

<Story
	name="Interactive"
	play={async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input')
		if (input) {
			input.focus()
		}
	}}
>
	<div style="width: 300px; padding: 20px;">
		<Search
			placeholder="Type to search recipes..."
			isLoading={false}
			onSearch={(query) => {
				console.log('Searching:', query)
				return query ? mockSuggestions.filter(item => 
					item.name.toLowerCase().includes(query.toLowerCase())
				) : []
			}}
			onSelect={(suggestion) => console.log('Selected:', suggestion)}
		/>
	</div>
</Story> 