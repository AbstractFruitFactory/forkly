<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Pill from './Pill.svelte'

	const { Story } = defineMeta({
		component: Pill,
		tags: ['autodocs'],
		argTypes: {
			text: {
				control: 'text'
			},
			color: {
				table: { disable: true }
			},
			onRemove: {
				table: { disable: true }
			},
			children: {
				table: { disable: true }
			}
		}
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<Pill text="Default Pill" {...args} />
	{/snippet}
</Story>

<Story name="With Remove Button">
	{#snippet children(args)}
		<Pill text="Removable Pill" color="#6366f1" onRemove={() => alert('Pill removed')} {...args} />
	{/snippet}
</Story>

<Story name="Long Text">
	{#snippet children(args)}
		<Pill text="This is a pill with a very long text that might wrap" color="#6366f1" {...args} />
	{/snippet}
</Story>
