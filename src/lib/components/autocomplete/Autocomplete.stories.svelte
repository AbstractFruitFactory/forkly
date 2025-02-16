<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Autocomplete from './Autocomplete.svelte'
	import Input from '../input/Input.svelte'
	import type { Component, ComponentProps } from 'svelte'
	import type { IngredientSearchResult } from '$lib/server/food-api'

	const { Story } = defineMeta<Component<ComponentProps<typeof Autocomplete>>>({
		title: 'Components/Autocomplete',
		component: Autocomplete,
		tags: ['autodocs']
	})

	const mockSuggestions: IngredientSearchResult = [
		{ name: 'Chicken' },
		{ name: 'Chicken Breast' },
		{ name: 'Chicken Thighs' },
		{ name: 'Chicken Stock' },
		{ name: 'Chicken Wings' }
	]

	const defaultStyle =
		'width: 100%; padding: 8px; border: 1px solid var(--color-neutral); border-radius: 4px; background-color: var(--color-neutral-lighter); color: var(--color-neutral-dark);'
</script>

<Story name="Empty">
	<div style="width: 300px; padding: 20px;">
		<Autocomplete
			suggestions={[]}
			isLoading={false}
			onSelect={(suggestion) => console.log('Selected:', suggestion)}
		>
			<Input>
				<input type="text" placeholder="Search ingredients..." />
			</Input>
		</Autocomplete>
	</div>
</Story>

<Story name="Loading">
	<div style="width: 300px; padding: 20px;">
		<Autocomplete
			suggestions={[]}
			isLoading={true}
			onSelect={(suggestion) => console.log('Selected:', suggestion)}
		>
			<Input>
				<input type="text" placeholder="Search ingredients..." value="chi" />
			</Input>
		</Autocomplete>
	</div>
</Story>

<Story name="With Suggestions">
	<div style="width: 300px; padding: 20px;">
		<Autocomplete
			suggestions={mockSuggestions}
			isLoading={false}
			onSelect={(suggestion) => console.log('Selected:', suggestion)}
		>
			<Input>
				<input type="text" placeholder="Search ingredients..." value="chicken" />
			</Input>
		</Autocomplete>
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
		<Autocomplete
			suggestions={mockSuggestions}
			isLoading={false}
			onSelect={(suggestion) => console.log('Selected:', suggestion)}
		>
			<Input>
				<input type="text" placeholder="Type 'chicken' to see suggestions..." />
			</Input>
		</Autocomplete>
	</div>
</Story>
