<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import NewRecipe from './NewRecipe.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte.ts'

	const defaultArgs = {
		unitSystem: 'imperial' as UnitSystem,
		onUnitChange: (system: UnitSystem) => {}
	}

	const { Story } = defineMeta({
		title: 'lib/pages/NewRecipe',
		component: NewRecipe,
		tags: ['!autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		args: defaultArgs
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<NewRecipe {...args} />
	{/snippet}
</Story>

<Story name="With Form Errors">
	{#snippet children(args)}
		<NewRecipe 
			errors={[
				{ path: 'title', message: 'Title is required' },
				{ path: 'ingredients.0.quantity', message: 'Quantity must be greater than 0' }
			]}
			{...args}
		/>
	{/snippet}
</Story>
