<script lang="ts">
	import { onDestroy } from 'svelte'

	let { error = '', id = crypto.randomUUID() } = $props()
	let uploading = $state(false)
	let preview = $state('')
	let inputElement: HTMLInputElement
	let dragOver = $state(false)

	const handleFileSelect = async (event: Event) => {
		const input = event.target as HTMLInputElement
		const file = input.files?.[0]

		if (!file) return
		handleFile(file)
	}

	const handleFile = (file: File) => {
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

		// Clean up previous preview
		if (preview) URL.revokeObjectURL(preview)

		// Create preview
		preview = URL.createObjectURL(file)

		// Store file in form data
		const form = inputElement.closest('form')
		if (form) {
			const formData = new FormData(form)
			formData.set('image', file)
		}

		// Clear error if successful
		error = ''
	}

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault()
		dragOver = true
	}

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault()
		dragOver = false
	}

	const handleDrop = (e: DragEvent) => {
		e.preventDefault()
		dragOver = false
		
		const file = e.dataTransfer?.files[0]
		if (file) handleFile(file)
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
		id={id}
		accept="image/*"
		onchange={handleFileSelect}
		class="hidden"
		bind:this={inputElement}
		aria-label="Upload recipe image"
		aria-describedby={error ? `${id}-error` : undefined}
	/>

	<button
		type="button"
		class="preview-area"
		class:has-preview={preview}
		class:drag-over={dragOver}
		onclick={() => inputElement.click()}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		aria-label={preview ? "Change recipe image" : "Add recipe image"}
	>
		{#if preview}
			<img
				src={preview}
				alt="Recipe preview"
				loading="eager"
				decoding="sync"
			/>
			<div class="preview-overlay">
				<span>Change Image</span>
			</div>
		{:else}
			<div class="placeholder" aria-hidden="true">
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
				<span>
					Drag and drop an image here<br />
					or click to browse
				</span>
			</div>
		{/if}
	</button>

	{#if error}
		<p class="error" id="{id}-error" role="alert">
			<span aria-hidden="true">⚠</span>
			{error}
		</p>
	{/if}
</div>

<style lang="scss">
	.image-upload {
		margin-bottom: var(--spacing-md);
	}

	.preview-area {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		border: var(--border-width-normal) dashed var(--color-neutral);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		cursor: pointer;
		background: var(--color-neutral-dark);
		transition: border-color var(--transition-fast) var(--ease-in-out),
					transform var(--transition-fast) var(--ease-in-out);
		will-change: transform;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: var(--color-primary);
			opacity: 0;
			transition: opacity var(--transition-fast) var(--ease-in-out);
			pointer-events: none;
			z-index: 1;
		}

		&:hover {
			border-color: var(--color-primary);

			&::after {
				opacity: 0.03;
			}

			.placeholder {
				color: var(--color-primary);

				svg {
					transform: scale(1.1);
				}
			}

			.preview-overlay {
				opacity: 1;
			}
		}

		&:focus {
			outline: none;
		}

		&:focus-visible {
			outline: 2px solid var(--color-primary);
			outline-offset: 2px;
		}

		&.has-preview {
			border-style: solid;
			border-color: var(--color-neutral);

			&:hover {
				border-color: var(--color-primary);
			}
		}

		&.drag-over {
			transform: scale(1.01);
			border-color: var(--color-primary);
			border-style: dashed;

			&::after {
				opacity: 0.05;
			}

			.placeholder {
				color: var(--color-primary);

				svg {
					transform: scale(1.2);
				}
			}
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
		color: var(--color-neutral);
		transition: color var(--transition-fast) var(--ease-in-out);
		padding: var(--spacing-md);
		text-align: center;

		svg {
			width: var(--spacing-2xl);
			height: var(--spacing-2xl);
			transition: transform var(--transition-fast) var(--ease-in-out);
			will-change: transform;
		}

		span {
			font-size: var(--font-size-sm);
			font-weight: 500;
			line-height: 1.5;
		}
	}

	.preview-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity var(--transition-fast) var(--ease-in-out);
		z-index: 2;

		span {
			color: white;
			font-weight: 500;
			font-size: var(--font-size-sm);
		}
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--transition-fast) var(--ease-in-out);
		will-change: transform;
		display: block;
	}

	.error {
		color: var(--color-error);
		font-size: var(--font-size-sm);
		margin-top: var(--spacing-xs);
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--color-error-light);
		border-radius: var(--border-radius-sm);
		border: 1px solid var(--color-error);

		span {
			font-size: var(--font-size-lg);
		}
	}

	.hidden {
		display: none;
	}

	@media (max-width: 600px) {
		.preview-area {
			aspect-ratio: 4 / 3;
		}

		.placeholder {
			svg {
				width: var(--spacing-xl);
				height: var(--spacing-xl);
			}

			span {
				font-size: var(--font-size-xs);
			}
		}
	}
</style>
