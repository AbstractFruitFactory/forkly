<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import CommentList from './CommentList.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/CommentList',
		component: CommentList,
		tags: ['autodocs']
	})

	const mockComments = [
		{
			id: '1',
			content: 'This recipe is amazing! I added some extra spices and it turned out perfect.',
			createdAt: new Date(Date.now() - 3600000),
			user: {
				id: 'user1',
				username: 'johndoe',
				avatarUrl: null
			}
		},
		{
			id: '2',
			content: 'I made this for dinner last night and my family loved it. Will definitely make it again!',
			createdAt: new Date(Date.now() - 86400000),
			user: {
				id: 'user2',
				username: 'sarahsmith',
				avatarUrl: 'https://i.pravatar.cc/150?u=sarahsmith'
			}
		},
		{
			id: '3',
			content: 'Here\'s how mine turned out! I followed the recipe exactly.',
			createdAt: new Date(Date.now() - 259200000),
			imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
			user: {
				id: 'user3',
				username: 'foodlover',
				avatarUrl: 'https://i.pravatar.cc/150?u=foodlover'
			}
		}
	]
</script>

<Story name="Empty Comments">
	{#snippet children(args)}
		<div style="width: 600px; padding: 20px; background-color: #1a1a1a;">
			<CommentList
				comments={[]}
				isLoggedIn={true}
				recipeId="recipe123"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Comments">
	{#snippet children(args)}
		<div style="width: 600px; padding: 20px; background-color: #1a1a1a;">
			<CommentList
				comments={mockComments}
				isLoggedIn={true}
				recipeId="recipe123"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Not Logged In">
	{#snippet children(args)}
		<div style="width: 600px; padding: 20px; background-color: #1a1a1a;">
			<CommentList
				comments={mockComments}
				isLoggedIn={false}
				recipeId="recipe123"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Form Error">
	{#snippet children(args)}
		<div style="width: 600px; padding: 20px; background-color: #1a1a1a;">
			<CommentList
				comments={mockComments}
				isLoggedIn={true}
				recipeId="recipe123"
				formError="Something went wrong. Please try again."
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Loading State">
	{#snippet children(args)}
		<div style="width: 600px; padding: 20px; background-color: #1a1a1a;">
			<CommentList
				comments={[]}
				isLoggedIn={true}
				recipeId="recipe123"
				loading={true}
				{...args}
			/>
		</div>
	{/snippet}
</Story> 