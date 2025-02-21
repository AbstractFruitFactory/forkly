<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Autocomplete from './Autocomplete.svelte'
	import Input from '../input/Input.svelte'
	import type { Component, ComponentProps } from 'svelte'
	import type { IngredientSearchResult } from '$lib/server/food-api'

	const { Story } = defineMeta<Component<ComponentProps<typeof Autocomplete>>>({
		component: Autocomplete,
		tags: ['autodocs']
	})

	const mockSuggestions: IngredientSearchResult = [
		{ name: 'Chicken', id: 5006, custom: false },
		{ name: 'Chicken Breast', id: 5062, custom: false },
		{ name: 'Chicken Thighs', id: 5091, custom: false },
		{ name: 'Chicken Stock', id: 6172, custom: false },
		{ name: 'Chicken Wings', id: 5100, custom: false }
	]

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
