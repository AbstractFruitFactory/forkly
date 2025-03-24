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
	{#snippet children(args)}
		<Button variant="secondary" {...args}>Click me</Button>
	{/snippet}
</Story>

<Story name="Text">
	{#snippet children(args)}
		<Button variant="text" {...args}>Click me</Button>
	{/snippet}
</Story>

<Story name="Small">
	{#snippet children(args)}
		<Button size="sm" {...args}>Click me</Button>
	{/snippet}
</Story>

<Story name="Large">
	{#snippet children(args)}
		<Button size="lg" {...args}>Click me</Button>
	{/snippet}
</Story>

<Story name="Full Width">
	{#snippet children(args)}
		<Button fullWidth {...args}>Click me</Button>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet children(args)}
		<Button disabled {...args}>Click me</Button>
	{/snippet}
</Story>

<Story name="Loading">
	{#snippet children(args)}
		<Button loading {...args}>Loading...</Button>
	{/snippet}
</Story>
