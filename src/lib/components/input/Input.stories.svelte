<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Input from './Input.svelte'
	import type { Component, ComponentProps } from 'svelte'

	type StoryProps = ComponentProps<typeof Input> & {
		actionButtonText: string
	}

	const { Story } = defineMeta<Component<StoryProps>>({
		component: Input,
		tags: ['autodocs'],
		parameters: {
			controls: {
				hideNoControlsWarning: true,
				exclude: ['children', 'actionButton', 'value']
			}
		},
		argTypes: {
			actionButtonText: {
				control: 'text'
			}
		}
	})

	let value = $state('')
</script>

<Story name="Default">
	{#snippet children(args)}
		<div style="width: 300px; padding: 20px;">
			<Input
				{...args}
				actionButton={args.actionButtonText
					? {
							text: args.actionButtonText,
							onClick: () => {}
						}
					: undefined}
				bind:value
			>
				<input type="text" placeholder="Enter text..." bind:value />
			</Input>
		</div>
	{/snippet}
</Story>
