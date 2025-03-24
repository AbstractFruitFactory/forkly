<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Comment from './Comment.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Comment',
		component: Comment,
		tags: ['autodocs']
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<div style="width: 500px; padding: 20px; background-color: #1a1a1a;">
			<Comment
				username="johndoe"
				content="This recipe looks amazing! I'll definitely try making it this weekend."
				createdAt={new Date(Date.now() - 3600000)}
				avatarUrl={null}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Avatar">
	{#snippet children(args)}
		<div style="width: 500px; padding: 20px; background-color: #1a1a1a;">
			<Comment
				username="sarahsmith"
				content="I made this last night and it was delicious! I added some extra spices and it turned out perfect."
				createdAt={new Date(Date.now() - 86400000)}
				avatarUrl="https://i.pravatar.cc/150?u=sarahsmith"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Image">
	{#snippet children(args)}
		<div style="width: 500px; padding: 20px; background-color: #1a1a1a;">
			<Comment
				username="foodlover"
				content="Here's how mine turned out! I followed the recipe exactly and it was perfect."
				createdAt={new Date(Date.now() - 259200000)}
				avatarUrl="https://i.pravatar.cc/150?u=foodlover"
				imageUrl="https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Long Comment">
	{#snippet children(args)}
		<div style="width: 500px; padding: 20px; background-color: #1a1a1a;">
			<Comment
				username="culinarychef"
				content="I've been a chef for 15 years and I have to say this recipe is exceptional. The balance of flavors is perfect and the technique is well described. I made a few adjustments based on what I had available in my pantry: substituted parsley for cilantro and used red onion instead of white. Still came out fantastic! I'll be adding this to my regular rotation."
				createdAt={new Date(Date.now() - 604800000)}
				avatarUrl="https://i.pravatar.cc/150?u=culinarychef"
				{...args}
			/>
		</div>
	{/snippet}
</Story> 