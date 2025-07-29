<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Autocomplete from './Autocomplete.svelte'
	import Input from '../input/Input.svelte'
	import type { Component, ComponentProps } from 'svelte'

	const { Story } = defineMeta<Component<ComponentProps<typeof Autocomplete>>>({
		component: Autocomplete,
		tags: ['autodocs'],
		parameters: {
			controls: {
				hideNoControlsWarning: true,
				exclude: [, 'onSelect', 'loadSuggestions', 'input']
			}
		}
	})

	const mockSuggestions = [
		{ name: 'Chicken' },
		{ name: 'Chicken Breast' },
		{ name: 'Chicken Thighs' },
		{ name: 'Chicken Stock' },
		{ name: 'Chicken Wings' }
	]

	const loadSuggestions = (query: string) =>
		mockSuggestions.filter((suggestion) =>
			suggestion.name.toLowerCase().includes(query.toLowerCase())
		)

	let value = $state('')
</script>

<Story name="Default">
	{#snippet children(args)}
		<div class="wrapper">
			<i> start typing "chicken" to see suggestions </i>
			<Autocomplete
				{loadSuggestions}
				isLoading={false}
				onSelect={(suggestion) => (value = suggestion.name)}
				{...args}
			>
				{#snippet input(onInput)}
					<Input>
						<input type="text" placeholder="Search ingredients..." oninput={onInput} bind:value />
					</Input>
				{/snippet}
			</Autocomplete>
		</div>
	{/snippet}
</Story>

<style>
	.wrapper {
		width: 300px;
		height: 25rem;
		display: flex;
		gap: 20px;
		flex-direction: column;
	}
</style>
