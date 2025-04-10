<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import FilterSelect from './FilterSelect.svelte'
	import type { Component, ComponentProps } from 'svelte'

	type StoryProps = ComponentProps<typeof FilterSelect>

	const { Story } = defineMeta<Component<StoryProps>>({
		title: 'lib/components/FilterSelect',
		component: FilterSelect,
		tags: ['autodocs'],
		argTypes: {
			label: { control: 'text' },
			searchPlaceholder: { control: 'text' }
		}
	})

	type Item = {
		label: string
		value: string
	}

	let selectedItems: Item[] = []

	const items: Item[] = [
		{ label: 'Item 1', value: '1' },
		{ label: 'Item 2', value: '2' },
		{ label: 'Item 3', value: '3' },
		{ label: 'Item 4', value: '4' },
		{ label: 'Item 5', value: '5' }
	]
</script>

<Story name="Default">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<FilterSelect
				label="Select items"
				searchPlaceholder="Search items..."
				onSearch={(query) => {
					return Promise.resolve(
						items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
					)
				}}
				bind:selected={selectedItems}
			>
				{#snippet item(result, select)}
					<button onclick={() => select({ value: result.value })}>{result.label}</button>
				{/snippet}
			</FilterSelect>

			<div style="margin-top: 20px; color: #fff;">
				Selected items: {selectedItems.map((item) => item.label).join(', ')}
			</div>
		</div>
	{/snippet}
</Story>
