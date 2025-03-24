<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import FilterSelect from './FilterSelect.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Filter Select',
		component: FilterSelect,
		tags: ['autodocs'],
		argTypes: {
			value: {
				control: 'text'
			},
			label: {
				control: 'text'
			},
			selected: {
				control: 'boolean'
			},
			onChange: {
				action: 'onChange'
			}
		}
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<FilterSelect
				value="vegetarian"
				label="Vegetarian"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Selected">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<FilterSelect
				value="gluten-free"
				label="Gluten Free"
				selected={true}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Multiple Filters">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a; display: flex; gap: 8px;">
			<FilterSelect
				value="italian"
				label="Italian"
				{...args}
			/>
			<FilterSelect
				value="mexican"
				label="Mexican"
				{...args}
			/>
			<FilterSelect
				value="asian"
				label="Asian"
				selected={true}
				{...args}
			/>
			<FilterSelect
				value="dessert"
				label="Dessert"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Custom ID">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<FilterSelect
				value="breakfast"
				label="Breakfast"
				id="breakfast-filter"
				{...args}
			/>
		</div>
	{/snippet}
</Story> 