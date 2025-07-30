<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import CommentList from './CommentList.svelte'
	import type { Component, ComponentProps } from 'svelte'

	type CommentT = {
		id: string
		content: string
		createdAt: string | Date
		imageUrl?: string
		user: {
			id: string
			username: string
			avatarUrl?: string
		}
	}

	const mockComments: CommentT[] = [
		{
			id: '1',
			content: 'This recipe is amazing! I added some extra spices and it turned out perfect.',
			createdAt: new Date(Date.now() - 3600000),
			user: {
				id: 'user1',
				username: 'johndoe',
				avatarUrl: undefined
			}
		},
		{
			id: '2',
			content:
				'I made this for dinner last night and my family loved it. Will definitely make it again!',
			createdAt: new Date(Date.now() - 86400000),
			user: {
				id: 'user2',
				username: 'sarahsmith',
				avatarUrl: 'https://i.pravatar.cc/150?u=sarahsmith'
			}
		},
		{
			id: '3',
			content: "Here's how mine turned out! I followed the recipe exactly.",
			createdAt: new Date(Date.now() - 259200000),
			imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
			user: {
				id: 'user3',
				username: 'foodlover',
				avatarUrl: 'https://i.pravatar.cc/150?u=foodlover'
			}
		}
	]

	const loadComments = async (pageNum: number): Promise<{ comments: CommentT[]; total: number }> => {
		const comments = mockComments.slice(pageNum * 10, (pageNum + 1) * 10)
		return {
			comments,
			total: mockComments.length
		}
	}

	const { Story } = defineMeta<Component<ComponentProps<typeof CommentList>>>({
		title: 'lib/components/CommentList',
		component: CommentList,
		tags: ['autodocs'],
		argTypes: {
			isLoggedIn: {
				control: 'boolean',
				defaultValue: true,
				name: 'logged in'
			},
			loading: {
				control: 'boolean',
				defaultValue: false,
				name: 'loading state'
			},
			formError: {
				control: 'text',
				defaultValue: null,
				name: 'error message'
			},
			comments: {
				control: 'select',
				options: ['empty', 'few', 'many'],
				mapping: {
					empty: [],
					few: mockComments,
					many: [
						...mockComments.map((c, i) => ({
							...c,
							id: `${c.id}-${i + 1}`
						})),
						...mockComments.map((c, i) => ({
							...c,
							id: `${c.id}-${i + 4}`
						})),
						...mockComments.map((c, i) => ({
							...c,
							id: `${c.id}-${i + 7}`
						})),
						...mockComments.map((c, i) => ({
							...c,
							id: `${c.id}-${i + 9}`
						}))
					]
				},
				defaultValue: 'few',
				name: 'comments'
			},
			recipeId: {
				table: { disable: true }
			},
			total: {
				table: { disable: true }
			},
			loadComments: {
				table: { disable: true }
			}
		},
		args: {
			loadComments
		}
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<CommentList
			recipeId="recipe123"
			comments={args.comments ?? []}
			isLoggedIn={args.isLoggedIn ?? false}
			total={args.comments ? args.comments.length : 0}
			loadComments={args.loadComments ?? loadComments}
		/>
	{/snippet}
</Story>

<Story name="Empty Comments">
	{#snippet children(args)}
		<CommentList comments={[]} isLoggedIn={true} recipeId="recipe123" total={0} loadComments={args.loadComments ?? loadComments} />
	{/snippet}
</Story>

<Story name="With Comments">
	{#snippet children(args)}
		<CommentList comments={mockComments} isLoggedIn={true} recipeId="recipe123" total={mockComments.length} loadComments={args.loadComments ?? loadComments} />
	{/snippet}
</Story>

<Story name="Not Logged In">
	{#snippet children(args)}
		<CommentList comments={mockComments} isLoggedIn={false} recipeId="recipe123" total={mockComments.length} loadComments={args.loadComments ?? loadComments} />
	{/snippet}
</Story>

<Story name="With Form Error">
	{#snippet children(args)}
		<CommentList
			comments={mockComments}
			isLoggedIn={true}
			recipeId="recipe123"
			formError="Something went wrong. Please try again."
			total={mockComments.length}
			loadComments={args.loadComments ?? loadComments}
		/>
	{/snippet}
</Story>

<Story name="Loading State">
	{#snippet children(args)}
		<CommentList comments={[]} isLoggedIn={true} recipeId="recipe123" loading={true} total={0} loadComments={args.loadComments ?? loadComments} />
	{/snippet}
</Story>
