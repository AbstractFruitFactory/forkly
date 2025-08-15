<script lang="ts">
	import Popup from '../popup/Popup.svelte'

	let {
		type = 'both',
		androidChooseFilesFirst = true,
		onChooseFiles,
		onTakePhoto,
		onRecordVideo,
		onCancel,
		title = 'Add media'
	}: {
		type?: 'image' | 'video' | 'both'
		androidChooseFilesFirst?: boolean
		onChooseFiles: () => void
		onTakePhoto?: () => void
		onRecordVideo?: () => void
		onCancel: () => void
		title?: string
	} = $props()
</script>

<Popup isOpen={true} {title} onClose={onCancel} closeOnClickOutside={true} width="min(420px, 92vw)">
	{#snippet children()}
		<div class="sheet">
			{#if androidChooseFilesFirst}
				<button type="button" class="sheet-btn primary" onclick={onChooseFiles}>Choose files</button>
				{#if type !== 'video'}
					<button type="button" class="sheet-btn" onclick={onTakePhoto}>Take Photo</button>
				{/if}
				{#if type !== 'image'}
					<button type="button" class="sheet-btn" onclick={onRecordVideo}>Record Video</button>
				{/if}
			{:else}
				{#if type !== 'video'}
					<button type="button" class="sheet-btn" onclick={onTakePhoto}>Take Photo</button>
				{/if}
				{#if type !== 'image'}
					<button type="button" class="sheet-btn" onclick={onRecordVideo}>Record Video</button>
				{/if}
				<button type="button" class="sheet-btn primary" onclick={onChooseFiles}>Choose files</button>
			{/if}
			<button type="button" class="sheet-btn cancel" onclick={onCancel}>Cancel</button>
		</div>
	{/snippet}
</Popup>

<style lang="scss">
	.sheet {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
	}

	.sheet-btn {
		appearance: none;
		background: var(--color-surface);
		border: 1px solid var(--color-neutral-light);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-md) var(--spacing-lg);
		text-align: center;
		cursor: pointer;
		font-weight: 600;
		transition: background var(--transition-fast) var(--ease-in-out);

		&:hover {
			background: var(--color-hover);
		}

		&.primary {
			background: var(--color-primary);
			border-color: var(--color-primary);
			color: white;
		}

		&.cancel {
			background: transparent;
			border: none;
			color: var(--color-neutral);
			font-weight: 500;
		}
	}
</style> 