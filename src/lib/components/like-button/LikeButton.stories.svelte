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
	let isLiked = false
	let count = 42
	const handleLike = () => {
		isLiked = !isLiked
		count = count + (isLiked ? 1 : -1)
	}
</script>

<Story name="Static Display">
	<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
		<LikeButton count={42} />
	</div>
</Story>

<Story name="Interactive">
	<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
		<LikeButton {count} {isLiked} interactive onLike={handleLike} />
	</div>
</Story>

<Story name="Zero Likes">
	<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
		<LikeButton count={0} />
	</div>
</Story>

<Story name="Many Likes">
	<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
		<LikeButton count={9999} />
	</div>
</Story>
