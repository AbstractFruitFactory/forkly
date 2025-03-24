<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import RecipeCreated from './RecipeCreated.svelte'
	import type { Component, ComponentProps } from 'svelte'

	const { Story } = defineMeta<Component<ComponentProps<typeof RecipeCreated>>>({
		title: 'lib/pages/RecipeCreated',
		component: RecipeCreated,
		tags: ['!autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<RecipeCreated recipeId="kR6xPm2bN9" {...args} />
	{/snippet}
</Story>

<Story name="Another ID">
	{#snippet children(args)}
		<RecipeCreated recipeId="Lz7yQn3cP4" {...args} />
	{/snippet}
</Story> 