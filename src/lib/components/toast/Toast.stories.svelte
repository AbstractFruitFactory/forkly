<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Toast from './Toast.svelte'
	import Button from '../button/Button.svelte'

	const { Story } = defineMeta({
		component: Toast,
		tags: ['autodocs']
	})
</script>

<script lang="ts">
	let defaultToast: Toast
	let successToast: Toast
	let errorToast: Toast
	let warningToast: Toast
	let infoToast: Toast
	let topToast: Toast
</script>

<Story name="Default">
	{#snippet children(args)}
		<div>
			<Button onclick={() => defaultToast.trigger()}>Show Default Toast</Button>
			<Toast bind:this={defaultToast} message="This is a default toast message" {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Success">
	{#snippet children(args)}
		<div>
			<Button onclick={() => successToast.trigger()}>Show Success Toast</Button>
			<Toast bind:this={successToast} message="Operation completed successfully!" type="success" {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Error">
	{#snippet children(args)}
		<div>
			<Button onclick={() => errorToast.trigger()}>Show Error Toast</Button>
			<Toast bind:this={errorToast} message="An error occurred. Please try again." type="error" {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Warning">
	{#snippet children(args)}
		<div>
			<Button onclick={() => warningToast.trigger()}>Show Warning Toast</Button>
			<Toast
				bind:this={warningToast}
				message="Warning: This action cannot be undone."
				type="warning"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Info">
	{#snippet children(args)}
		<div>
			<Button onclick={() => infoToast.trigger()}>Show Info Toast</Button>
			<Toast bind:this={infoToast} message="New updates are available." type="info" {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Top Position">
	{#snippet children(args)}
		<div>
			<Button onclick={() => topToast.trigger()}>Show Top Toast</Button>
			<Toast
				bind:this={topToast}
				message="This toast appears at the top of the screen."
				position="top"
				{...args}
			/>
		</div>
	{/snippet}
</Story>
