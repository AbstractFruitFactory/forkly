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
	<div style="padding: 2rem;">
		<ShareButton />
	</div>
</Story>

<Story name="Custom URL and Title">
	<div style="padding: 2rem;">
		<ShareButton
			url="https://example.com/my-awesome-recipe"
			title="Check out this delicious recipe!"
		/>
	</div>
</Story>
