<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Search from './Search.svelte'
	import type { Component, ComponentProps } from 'svelte'

	type StoryProps = ComponentProps<typeof Search> & {
		// Add your custom story parameters here
	}

	const { Story } = defineMeta<Component<StoryProps>>({
		component: Search,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			controls: {
				hideNoControlsWarning: true,
				exclude: ['inputElement', 'actionButton', 'onInput', 'value']
			}
		}
	})

	const mockSuggestions = [
		{ name: 'Spaghetti Carbonara' },
		{ name: 'Chicken Parmesan' },
		{ name: 'Beef Stir Fry' },
		{ name: 'Vegetable Curry' },
		{ name: 'Caesar Salad' }
	]
</script>

<Story name="Basic Search">
	{#snippet children(args)}
		<div style="width: 300px; padding: 20px;">
			<Search placeholder="Search recipes..." isLoading={false} {...args} />
		</div>
	{/snippet}
</Story>