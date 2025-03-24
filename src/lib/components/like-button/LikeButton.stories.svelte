<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import LikeButton from './LikeButton.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Like Button',
		component: LikeButton,
		tags: ['autodocs'],
		argTypes: {
			count: {
				control: 'number',
				description: 'Number of likes'
			},
			isLiked: {
				control: 'boolean',
				description: 'Whether the current user has liked this item'
			},
			interactive: {
				control: 'boolean',
				description: 'Whether the button can be clicked (requires user to be logged in)'
			}
		}
	})
</script>

<script lang="ts">
	let isLiked = $state(false)
	let count = $state(42)
	const handleLike = () => {
		isLiked = !isLiked
		count = count + (isLiked ? 1 : -1)
	}
</script>

<Story name="Static Display">
	{#snippet children(args)}
		<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
			<LikeButton count={42} {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Interactive">
	{#snippet children(args)}
		<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
			<LikeButton count={count} isLiked={isLiked} interactive onLike={handleLike} {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Zero Likes">
	{#snippet children(args)}
		<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
			<LikeButton count={0} {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Many Likes">
	{#snippet children(args)}
		<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
			<LikeButton count={9999} {...args} />
		</div>
	{/snippet}
</Story>
