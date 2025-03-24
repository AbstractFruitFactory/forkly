<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Search from './Search.svelte'
	import SuggestionSearch from './SuggestionSearch.svelte'
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

<Story name="Basic Search">
	{#snippet children(args)}
		<div style="width: 300px; padding: 20px;">
			<Search
				placeholder="Search recipes..."
				isLoading={false}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Search with Loading">
	{#snippet children(args)}
		<div style="width: 300px; padding: 20px;">
			<Search
				placeholder="Search recipes..."
				isLoading={true}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Search with Action Button">
	{#snippet children(args)}
		<div style="width: 300px; padding: 20px;">
			<Search
				placeholder="Search recipes..."
				isLoading={false}
				actionButton={{
					text: "Clear",
					onClick: () => console.log("Cleared")
				}}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Basic Suggestion Search">
	{#snippet children(args)}
		<div style="width: 300px; padding: 20px;">
			<SuggestionSearch
				placeholder="Search recipes..."
				isLoading={false}
				onSearch={(query) => mockSuggestions}
				onSelect={(suggestion) => console.log('Selected:', suggestion)}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Suggestion Search with Loading">
	{#snippet children(args)}
		<div style="width: 300px; padding: 20px;">
			<SuggestionSearch
				placeholder="Search recipes..."
				isLoading={true}
				onSearch={(query) => mockSuggestions}
				onSelect={(suggestion) => console.log('Selected:', suggestion)}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Interactive Suggestion Search" play={async ({ canvasElement }) => {
	const input = canvasElement.querySelector('input')
	if (input) {
		input.focus()
	}
}}>
	{#snippet children(args)}
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
				{...args}
			/>
		</div>
	{/snippet}
</Story> 