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
				control: 'color'
			},
			onRemove: {
				action: 'onRemove'
			}
		}
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<Pill text="Default Pill" color="#6366f1" {...args} />
	{/snippet}
</Story>

<Story name="With Remove Button">
	{#snippet children(args)}
		<Pill text="Removable Pill" color="#6366f1" onRemove={() => alert('Pill removed')} {...args} />
	{/snippet}
</Story>

<Story name="Different Colors">
	{#snippet children(args)}
		<div style="display: flex; gap: 8px; flex-wrap: wrap;">
			<Pill text="Primary" color="#6366f1" {...args} />
			<Pill text="Success" color="#10b981" {...args} />
			<Pill text="Warning" color="#f59e0b" {...args} />
			<Pill text="Danger" color="#ef4444" {...args} />
			<Pill text="Info" color="#3b82f6" {...args} />
			<Pill text="Dark" color="#1f2937" {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Long Text">
	{#snippet children(args)}
		<Pill text="This is a pill with a very long text that might wrap" color="#6366f1" {...args} />
	{/snippet}
</Story>