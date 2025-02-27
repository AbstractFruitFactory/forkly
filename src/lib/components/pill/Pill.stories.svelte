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
	<Pill text="Default Pill" color="#6366f1" />
</Story>

<Story name="With Remove Button">
	<Pill text="Removable Pill" color="#6366f1" onRemove={() => alert('Pill removed')} />
</Story>

<Story name="Different Colors">
	<div style="display: flex; gap: 8px; flex-wrap: wrap;">
		<Pill text="Primary" color="#6366f1" />
		<Pill text="Success" color="#10b981" />
		<Pill text="Warning" color="#f59e0b" />
		<Pill text="Danger" color="#ef4444" />
		<Pill text="Info" color="#3b82f6" />
		<Pill text="Dark" color="#1f2937" />
	</div>
</Story>

<Story name="Long Text">
	<Pill text="This is a pill with a very long text that might wrap" color="#6366f1" />
</Story>