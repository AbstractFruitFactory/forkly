<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import ProfilePic from './ProfilePic.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Profile Pic',
		component: ProfilePic,
		tags: ['autodocs'],
		argTypes: {
			profilePicUrl: {
				control: 'text'
			},
			size: {
				control: 'text'
			}
		}
	})
</script>

<Story name="With Image">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<ProfilePic
				profilePicUrl="https://i.pravatar.cc/150?u=user123"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Default (No Image)">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<ProfilePic {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Different Sizes">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a; display: flex; gap: 16px; align-items: center;">
			<ProfilePic
				profilePicUrl="https://i.pravatar.cc/150?u=user123"
				size="24px"
				{...args}
			/>
			<ProfilePic
				profilePicUrl="https://i.pravatar.cc/150?u=user123"
				size="48px"
				{...args}
			/>
			<ProfilePic
				profilePicUrl="https://i.pravatar.cc/150?u=user123"
				size="72px"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Different Placeholder Sizes">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a; display: flex; gap: 16px; align-items: center;">
			<ProfilePic size="24px" {...args} />
			<ProfilePic size="48px" {...args} />
			<ProfilePic size="72px" {...args} />
		</div>
	{/snippet}
</Story> 