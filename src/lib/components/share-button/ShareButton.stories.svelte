<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import ShareButton from './ShareButton.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Share Button',
		component: ShareButton,
		tags: ['autodocs']
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<div style="padding: 2rem;">
			<ShareButton {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Custom URL and Title">
	{#snippet children(args)}
		<div style="padding: 2rem;">
			<ShareButton
				url="https://example.com/my-awesome-recipe"
				title="Check out this delicious recipe!"
				{...args}
			/>
		</div>
	{/snippet}
</Story>
