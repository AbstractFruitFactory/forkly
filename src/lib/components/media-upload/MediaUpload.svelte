<script lang="ts">
	/**
	 * Media Upload Component
	 *
	 * @component
	 * @example
	 * ```svelte
	 * <MediaUpload
	 *   type="video"
	 *   maxSize={50}
	 *   maxDuration={10}
	 *   name="video-upload"
	 *   bind:error
	 * />
	 * ```
	 */
	import { onDestroy } from 'svelte'
	import { handleMediaFile, cleanupPreview } from '$lib/utils/mediaHandling'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let {
		error,
		id = crypto.randomUUID(),
		type = 'both',
		name = 'media',
		aspectRatio = '16/9',
		previewAlt = 'Media preview',
		onFile
	}: {
		error?: string
		id?: string
		type?: 'image' | 'video' | 'both'
		name?: string
		maxDuration?: number
		aspectRatio?: string
		previewAlt?: string
		onFile?: (file: File) => void
	} = $props()

	let preview = $state('')
	let inputElement: HTMLInputElement
	let dragOver = $state(false)
	let mediaType = $state<'image' | 'video' | null>(null)

	const MAX_VIDEO_DURATION_SECONDS = 10
	const MAX_VIDEO_SIZE_MB = 10

	const handleFileSelect = async (event: Event) => {
		const input = event.target as HTMLInputElement
		const file = input.files?.[0]

		if (!file) return
		handleFile(file)
	}

	const handleFile = async (file: File) => {
		// Clean up previous preview
		if (preview) cleanupPreview(preview)

		// Use the utility function to handle the file
		const result = await handleMediaFile(file, {
			type,
			maxSize: MAX_VIDEO_SIZE_MB,
			maxDuration: MAX_VIDEO_DURATION_SECONDS
		})

		// Update state based on result
		error = result.error
		preview = result.preview
		mediaType = result.mediaType

		if (!error) {
			// Set the file directly on the input element
			const dataTransfer = new DataTransfer()
			dataTransfer.items.add(file)
			inputElement.files = dataTransfer.files
			dispatch('change', file)
			onFile?.(file)
		}
	}

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault()
		dragOver = true
	}

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault()
		dragOver = false
	}

	const handleDrop = async (e: DragEvent) => {
		e.preventDefault()
		dragOver = false

		const file = e.dataTransfer?.files[0]
		if (file) await handleFile(file)
	}

	onDestroy(() => {
		// Clean up object URL
		if (preview) cleanupPreview(preview)
	})
</script>

<input
	type="file"
	{name}
	{id}
	accept={type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'image/*,video/*'}
	onchange={handleFileSelect}
	class="hidden"
	bind:this={inputElement}
	aria-label={`Upload ${type === 'image' ? 'image' : type === 'video' ? 'video' : 'media'}`}
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
>
	{#if preview && mediaType === 'image'}
		<img src={preview} alt={previewAlt} loading="eager" decoding="sync" />
		<div class="preview-overlay">
			<span>Change Image</span>
		</div>
	{:else if preview && mediaType === 'video'}
		<video src={preview} controls muted class="video-preview"></video>
		<div class="preview-overlay">
			<span>Change Video</span>
		</div>
	{:else}
		<div class="placeholder" aria-hidden="true">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="var(--color-text-on-surface)"
				stroke-width="2"
			>
				{#if type === 'video'}
					<polygon points="23 7 16 12 23 17 23 7"></polygon>
					<rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
				{:else}
					<path
						d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
					/>
					<circle cx="12" cy="13" r="4" />
				{/if}
			</svg>
			<span>
				Drag and drop {type === 'image'
					? 'an image'
					: type === 'video'
						? 'a video'
						: 'an image or video'} here<br />
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

<style lang="scss">
	.preview-area {
		position: relative;
		width: 100%;
		aspect-ratio: var(--aspect-ratio, 16/9);
		border: var(--border-width-normal) dashed var(--color-neutral);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		cursor: pointer;
		background: var(--color-surface);
		transition:
			border-color var(--transition-fast) var(--ease-in-out),
			transform var(--transition-fast) var(--ease-in-out);
		will-change: transform;
		display: block;

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
			color: var(--color-text-on-surface);
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
			color: var(--color-text-on-surface);
			font-weight: 500;
			font-size: var(--font-size-sm);
		}
	}

	img,
	.video-preview {
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
