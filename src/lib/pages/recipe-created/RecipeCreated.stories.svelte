<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import RecipeCreated from './RecipeCreated.svelte'
	import type { Component, ComponentProps } from 'svelte'

	const { Story } = defineMeta<Component<ComponentProps<typeof RecipeCreated>>>({
		title: 'Pages/RecipeCreated',
		component: RecipeCreated,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	})
</script>

<Story name="Default" args={{ recipeId: 123 }} />

<Story name="Long Recipe ID" args={{ recipeId: 999999999 }} /> 