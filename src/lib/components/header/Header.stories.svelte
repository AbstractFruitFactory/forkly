<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Header from './Header.svelte'
	import type { Component, ComponentProps } from 'svelte'

	const { Story } = defineMeta<Component<ComponentProps<typeof Header>>>({
		title: 'lib/components/Header',
		component: Header,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		argTypes: {
			loggedIn: {
				control: 'boolean',
				defaultValue: false,
				name: 'logged in'
			},
			profilePicUrl: {
				control: 'text',
				defaultValue: 'https://i.pravatar.cc/150?u=user123',
				name: 'profile picture URL'
			},
			actions: {
				table: { disable: true }
			},
			logo: {
				table: { disable: true }
			},
			newRecipeHref: {
				table: { disable: true }
			},
			profileHref: {
				table: { disable: true }
			},
			loginHref: {
				table: { disable: true }
			}
		}
	})
</script>

<Story name="Logged Out">
	{#snippet children(args)}
		<div style="padding: 0 20px;">
			<Header loggedIn={false} newRecipeHref="/new-recipe" loginHref="/login" {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Logged In">
	{#snippet children(args)}
		<div style="padding: 0 20px;">
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
		<div style="padding: 0 20px;">
			<Header loggedIn={true} newRecipeHref="/new-recipe" profileHref="/profile" {...args} />
		</div>
	{/snippet}
</Story>
