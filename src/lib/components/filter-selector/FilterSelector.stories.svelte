<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import FilterSelector from './FilterSelector.svelte'
	import type { Component, ComponentProps } from 'svelte'

	type StoryProps = ComponentProps<typeof FilterSelector>

	const { Story } = defineMeta<Component<StoryProps>>({
		title: 'lib/components/FilterSelector',
		component: FilterSelector,
		tags: ['autodocs'],
		argTypes: {
			items: { control: { type: 'object' } },
			name: { control: 'text' },
			label: { control: 'text' },
			allowCustomItems: { control: 'boolean' }
		}
	})

	const mockItems = [
		'Filter 1',
		'Filter 2',
		'Filter 3',
		'Filter 4',
		'Filter 5'
	]

	let selectedItems = $state<string[]>([])
</script>

<Story name="Default">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<FilterSelector 
				items={mockItems}
				name="filters"
				bind:selectedItems
				{...args} 
			/>
			<div style="margin-top: 20px; color: #fff;">
				Selected items: {selectedItems.join(', ')}
			</div>
		</div>
	{/snippet}
</Story>

<Story name="With Custom Label">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<FilterSelector 
				items={mockItems}
				name="filters"
				label="Add Filter"
				bind:selectedItems
				{...args} 
			/>
			<div style="margin-top: 20px; color: #fff;">
				Selected items: {selectedItems.join(', ')}
			</div>
		</div>
	{/snippet}
</Story>

<Story name="With Custom Items">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<FilterSelector 
				items={mockItems}
				name="filters"
				allowCustomItems={true}
				bind:selectedItems
				{...args} 
			/>
			<div style="margin-top: 20px; color: #fff;">
				Selected items: {selectedItems.join(', ')}
			</div>
		</div>
	{/snippet}
</Story>

<Story name="With Async Loading">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<FilterSelector 
				items={mockItems}
				name="filters"
				loadItems={async (query) => {
					await new Promise(resolve => setTimeout(resolve, 500))
					return mockItems.filter(item => 
						item.toLowerCase().includes(query.toLowerCase())
					)
				}}
				bind:selectedItems
				{...args} 
			/>
			<div style="margin-top: 20px; color: #fff;">
				Selected items: {selectedItems.join(', ')}
			</div>
		</div>
	{/snippet}
</Story> 