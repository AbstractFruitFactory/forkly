<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import SearchButton from './SearchButton.svelte'

	const { Story } = defineMeta({
		component: SearchButton,
		title: 'lib/components/SearchButton',
		tags: ['autodocs']
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<SearchButton {...args} />
	{/snippet}
</Story>