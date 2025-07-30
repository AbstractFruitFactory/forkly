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
			},
			isLoading: {
				control: 'boolean'
			},
			clearButton: {
				table: { disable: true }
			}
		}
	})

	let value = $state('')
	let textareaValue = $state('')
	let actionButtonValue = $state('')
	let loadingValue = $state('')
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

<Story name="Textarea">
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
				value={textareaValue}
			>
				<textarea 
					bind:value={textareaValue}
					placeholder="Enter your message..."
					rows="4"
				></textarea>
			</Input>
		</div>
	{/snippet}
</Story>

<Story name="With Action Button">
	{#snippet children(args)}
		<div style="width: 300px; padding: 20px;">
			<Input
				{...args}
				actionButton={{
					text: 'Search',
					onClick: () => {
						console.log('Search clicked:', actionButtonValue)
					}
				}}
				value={actionButtonValue}
			>
				<input 
					type="text" 
					placeholder="Search recipes..." 
					bind:value={actionButtonValue}
				/>
			</Input>
		</div>
	{/snippet}
</Story>

<Story name="Loading">
	{#snippet children(args)}
		<div style="width: 300px; padding: 20px;">
			<Input
				{...args}
				isLoading={true}
				value={loadingValue}
			>
				<input 
					type="text" 
					placeholder="Loading..." 
					bind:value={loadingValue}
					disabled
				/>
			</Input>
		</div>
	{/snippet}
</Story>
