<script lang="ts">
	import { onDestroy } from 'svelte'

	let { error = '' } = $props()
	let uploading = $state(false)
	let preview = $state('')
	let inputElement: HTMLInputElement

	const handleFileSelect = async (event: Event) => {
		const input = event.target as HTMLInputElement
		const file = input.files?.[0]

		if (!file) return

		// Validate file type
		if (!file.type.startsWith('image/')) {
			error = 'Please select an image file'
			return
		}

		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			error = 'Image must be less than 5MB'
			return
		}

		// Create preview
		preview = URL.createObjectURL(file)

		// Store file in form data
		const form = input.closest('form')
		if (form) {
			const formData = new FormData(form)
			formData.set('image', file)
		}
	}

	onDestroy(() => {
		// Clean up object URL
		if (preview) URL.revokeObjectURL(preview)
	})
</script>

<div class="image-upload">
	<input
		type="file"
		name="image"
		accept="image/*"
		onchange={handleFileSelect}
		class="hidden"
		bind:this={inputElement}
	/>

	<button class="preview-area" class:has-preview={preview} onclick={() => inputElement.click()}>
		{#if preview}
			<img src={preview} alt="Recipe preview" />
		{:else}
			<div class="placeholder">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
					/>
					<circle cx="12" cy="13" r="4" />
				</svg>
				<span>Add Recipe Photo</span>
			</div>
		{/if}
	</button>

	{#if error}
		<p class="error">{error}</p>
	{/if}
</div>

<style lang="scss">
	.image-upload {
		margin-bottom: var(--spacing-md);
	}

	.preview-area {
		position: relative;
		width: 100%;
		height: calc(var(--spacing-2xl) * 4);
		border: var(--border-width-normal) dashed var(--color-neutral);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);
		background: var(--color-neutral-dark);

		&:hover {
			border-color: var(--color-primary);
		}

		&.has-preview {
			border-style: solid;
		}

		input[type='file'] {
			position: absolute;
			inset: 0;
			opacity: 0;
			cursor: pointer;
		}

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);

		svg {
			width: var(--spacing-2xl);
			height: var(--spacing-2xl);
		}

		span {
			color: var(--color-neutral);
			font-size: var(--font-size-sm);
		}
	}

	.error {
		color: var(--color-error);
		font-size: var(--spacing-md);
		margin-top: var(--spacing-xs);
	}

	.hidden {
		display: none;
	}
</style>
