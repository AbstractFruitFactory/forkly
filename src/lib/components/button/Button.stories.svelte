<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Button from './Button.svelte'

	const { Story } = defineMeta({
		component: Button,
		tags: ['autodocs']
	})
</script>

<Story name="Primary">
	{#snippet children(args)}
		<Button {...args}>Click me</Button>
	{/snippet}
</Story>

<Story name="Secondary">
	<Button variant="secondary">Click me</Button>
</Story>

<Story name="Text">
	<Button variant="text">Click me</Button>
</Story>

<Story name="Small">
	<Button size="sm">Click me</Button>
</Story>

<Story name="Large">
	<Button size="lg">Click me</Button>
</Story>

<Story name="Full Width">
	<Button fullWidth>Click me</Button>
</Story>

<Story name="Disabled">
	<Button disabled>Click me</Button>
</Story>

<Story name="Loading">
	<Button loading>Loading...</Button>
</Story>
