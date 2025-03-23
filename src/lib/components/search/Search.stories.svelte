<script lang="ts" context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Search from './Search.svelte'
	import SuggestionSearch from './SuggestionSearch.svelte'
	import type { Component, ComponentProps } from 'svelte'

	const { Story, stories } = defineMeta<Component<ComponentProps<typeof Search>>>({
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

<Story name="Basic Search">
	<div style="width: 300px; padding: 20px;">
		<Search
			placeholder="Search recipes..."
			isLoading={false}
		/>
	</div>
</Story>

<Story name="Search with Loading">
	<div style="width: 300px; padding: 20px;">
		<Search
			placeholder="Search recipes..."
			isLoading={true}
		/>
	</div>
</Story>

<Story name="Search with Action Button">
	<div style="width: 300px; padding: 20px;">
		<Search
			placeholder="Search recipes..."
			isLoading={false}
			actionButton={{
				text: "Clear",
				onClick: () => console.log("Cleared")
			}}
		/>
	</div>
</Story>

<Story name="Basic Suggestion Search">
	<div style="width: 300px; padding: 20px;">
		<SuggestionSearch
			placeholder="Search recipes..."
			isLoading={false}
			onSearch={(query) => mockSuggestions}
			onSelect={(suggestion) => console.log('Selected:', suggestion)}
		/>
	</div>
</Story>

<Story name="Suggestion Search with Loading">
	<div style="width: 300px; padding: 20px;">
		<SuggestionSearch
			placeholder="Search recipes..."
			isLoading={true}
			onSearch={(query) => mockSuggestions}
			onSelect={(suggestion) => console.log('Selected:', suggestion)}
		/>
	</div>
</Story>

<Story
	name="Interactive Suggestion Search"
	play={async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input')
		if (input) {
			input.focus()
		}
	}}
>
	<div style="width: 300px; padding: 20px;">
		<SuggestionSearch
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