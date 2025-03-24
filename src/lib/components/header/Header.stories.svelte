<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Header from './Header.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Header',
		component: Header,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	})
</script>

<Story name="Logged Out">
	{#snippet children(args)}
		<div style="padding: 0 20px; background-color: #1a1a1a;">
			<Header
				loggedIn={false}
				newRecipeHref="/new-recipe"
				loginHref="/login"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Logged In">
	{#snippet children(args)}
		<div style="padding: 0 20px; background-color: #1a1a1a;">
			<Header
				loggedIn={true}
				newRecipeHref="/new-recipe"
				profileHref="/profile"
				profilePicUrl="https://i.pravatar.cc/150?u=user123"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Logged In No Profile Pic">
	{#snippet children(args)}
		<div style="padding: 0 20px; background-color: #1a1a1a;">
			<Header
				loggedIn={true}
				newRecipeHref="/new-recipe"
				profileHref="/profile"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Mobile View">
	{#snippet children(args)}
		<div style="padding: 0 20px; background-color: #1a1a1a; max-width: 480px;">
			<Header
				loggedIn={true}
				newRecipeHref="/new-recipe"
				profileHref="/profile"
				profilePicUrl="https://i.pravatar.cc/150?u=user123"
				{...args}
			/>
		</div>
	{/snippet}
</Story> 