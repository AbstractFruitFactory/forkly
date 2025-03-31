<script lang="ts">
	import { scale } from 'svelte/transition'
	import Share from 'lucide-svelte/icons/share-2'
	import ActionButton from '$lib/components/action-button/ActionButton.svelte'
	import Toast from '../toast/Toast.svelte'
	import SharePopup from './SharePopup.svelte'

	let {
		url,
		title
	}: {
		url?: string
		title?: string
	} = $props()

	let isPopupOpen = $state(false)
	let toast: Toast

	const togglePopup = () => {
		isPopupOpen = !isPopupOpen
	}

	const handleLinkCopied = () => {
		toast.trigger()
	}
</script>

<div class="share-wrapper">
	<ActionButton
		onAction={togglePopup}
		icon={Share}
		inactiveLabel="Share"
		interactive={true}
		--inactive-color="var(--color-text)"
	/>

	<Toast bind:this={toast} message="Link copied to clipboard!" type="success" />
</div>

<SharePopup 
	isOpen={isPopupOpen} 
	onClose={togglePopup} 
	{url} 
	{title} 
	onLinkCopied={handleLinkCopied} 
/>

<style lang="scss">
	.share-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;

		:global(svg) {
			transform: translateX(-1px);
		}
	}

	.share-popup-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.share-description {
		margin: 0 0 var(--spacing-sm);
		color: var(--color-text);
	}

	.share-item-preview {
		background: var(--color-hover);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.share-item-title {
		margin: 0 0 var(--spacing-xs);
		font-size: var(--font-size-md);
		font-weight: 600;
	}

	.share-item-url {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-neutral);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.share-options {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-md);
	}

	.share-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		background: transparent;
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius-md);
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);

		&:hover {
			background: var(--color-hover);
			border-color: var(--color-primary);
			color: var(--color-primary);
		}
	}

	.share-option-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-neutral);
		height: 40px;
		position: relative;
	}

	.icon-container {
		position: relative;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.link-icon {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.success-animation {
		position: absolute;
		top: 0;
		left: 0;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.success-circle-outline {
		width: 30px;
		height: 30px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		stroke-dasharray: 166;
		stroke-dashoffset: 166;
		animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
	}

	.success-checkmark {
		width: 30px;
		height: 30px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.checkmark-path {
		stroke-dasharray: 48;
		stroke-dashoffset: 48;
		animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.4s forwards;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	@keyframes stroke {
		100% {
			stroke-dashoffset: 0;
		}
	}

	.share-footer {
		display: flex;
		justify-content: flex-end;
		margin-top: var(--spacing-md);
	}
</style>
