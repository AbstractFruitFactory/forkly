<script lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import NewRecipe from './NewRecipe.svelte'
	import type { Component, ComponentProps } from 'svelte'

	const { Story } = defineMeta<Component<ComponentProps<typeof NewRecipe>>>({
		component: NewRecipe,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	})
</script>

<Story name="Default" />

<Story
	name="With Form Errors"
	args={{
		errors: [
			{ path: 'title', message: 'Title is required' },
			{ path: 'ingredients.0.quantity', message: 'Quantity must be greater than 0' }
		]
	}}
/>
