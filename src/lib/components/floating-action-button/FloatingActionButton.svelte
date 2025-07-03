<script lang="ts">
	import type { Snippet } from 'svelte'
	import Skeleton from '../skeleton/Skeleton.svelte'

	let {
		text,
		onClick,
		isActive = false,
		loading = false,
		children
	}: {
		text?: string
		onClick?: () => void
		isActive?: boolean
		loading?: boolean
		children: Snippet
	} = $props()
</script>

<div class="action-button-container">
	{#if loading}
		<div class="action-button-skeleton">
			<Skeleton width="50px" height="50px" round={true} />
		</div>
		{#if text}
			<Skeleton width="40px" height="12px" />
		{/if}
	{:else}
		<button class="action-button" class:active={isActive} onclick={onClick}>
			{@render children()}
		</button>
		{#if text}
			<span class="button-text">{text}</span>
		{/if}
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
                background: var(--color-neutral-2);
                color: var(--color-text-on-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);

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
</style>
