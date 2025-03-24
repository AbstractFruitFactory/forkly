<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import AuthForm from './AuthForm.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Auth Form',
		component: AuthForm,
		tags: ['autodocs']
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<AuthForm alternateHref="/signup" {...args} />
	{/snippet}
</Story>

<Story name="With Error">
	{#snippet children(args)}
		<AuthForm error="Invalid username or password" alternateHref="/signup" {...args} />
	{/snippet}
</Story>
