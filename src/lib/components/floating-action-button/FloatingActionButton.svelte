<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		text,
		onClick,
		isActive = false,
		children
	}: {
		text?: string
		onClick?: () => void
		isActive?: boolean
		children: Snippet
	} = $props()
</script>

<div class="action-button-container">
	<button class="action-button" class:active={isActive} onclick={onClick}>
		{@render children()}
	</button>
	{#if text}
		<span class="button-text">{text}</span>
	{/if}
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.action-button-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.action-button {
		width: 50px;
		height: 50px;
		border-radius: var(--border-radius-full);
		border: var(--border-width-thin) solid var(--color-neutral);
		background: var(--color-neutral-dark);
		color: var(--color-text);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);

		svg {
			width: 16px;
			height: 16px;
			stroke-width: 1.5;
		}

		&:hover {
			background: var(--color-neutral);
			transform: translateY(-2px);
		}

		&:active {
			transform: translateY(0);
		}
	}

	.button-text {
		font-family: 'DM Sans', sans-serif;
		font-size: 11px;
		color: var(--color-neutral-light);
		text-align: center;
	}

	@include tablet {
		.action-button {
			width: 40px;
			height: 40px;

			svg {
				width: 15px;
				height: 15px;
			}
		}
	}

	@include mobile {
		.action-button {
			width: 28px;
			height: 28px;

			svg {
				width: 14px;
				height: 14px;
			}
		}
	}
</style>
