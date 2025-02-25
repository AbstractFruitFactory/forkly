<script lang="ts">
	import Heart from 'lucide-svelte/icons/heart'

	let {
		count = 0,
		isLiked = false,
		interactive = false,
		onLike
	}: {
		count: number
		isLiked?: boolean
		interactive?: boolean
		onLike?: () => void
	} = $props()
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
	this={interactive ? 'button' : 'div'}
	class="like-button"
	class:liked={isLiked}
	onclick={interactive ? onLike : undefined}
	aria-label={interactive ? (isLiked ? 'Unlike recipe' : 'Like recipe') : `${count} likes`}
>
	<Heart size={interactive ? 20 : 16} class={interactive ? (isLiked ? 'filled' : '') : 'filled'} />
	<span class="count">{count}</span>
</svelte:element>

<style lang="scss">
	.like-button {
		background: var(--color-neutral-dark);
		border: none;
		border-radius: var(--border-radius-full);
		padding: var(--spacing-xs) var(--spacing-sm);
		color: var(--color-neutral-light);
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		width: fit-content;

		&.liked {
			color: var(--color-primary);
			background: var(--color-primary-dark);
		}

		:global(svg) {
			transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
			transform-origin: center;
			fill: transparent;
		}

		:global(.filled) {
			fill: currentColor;
		}
	}

	button.like-button {
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-out);

		&:hover {
			transform: scale(1.05);

			:global(svg) {
				transform: scale(1.15);
			}
		}

		:global(svg) {
			transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
		}

		&.liked :global(svg) {
			transform: scale(1.1);
			animation: heartPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
		}
	}

	@keyframes heartPop {
		0% {
			transform: scale(1);
			fill: transparent;
		}
		50% {
			transform: scale(1.4);
			fill: currentColor;
		}
		100% {
			transform: scale(1.2);
			fill: currentColor;
		}
	}

	.count {
		font-size: var(--font-size-sm);
		font-weight: 600;
	}
</style>
