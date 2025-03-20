<script lang="ts">
	import Comment from './Comment.svelte'
	import Popover from '$lib/components/popover/Popover.svelte'
	import MessageSquare from 'lucide-svelte/icons/message-square'
	import ImageIcon from 'lucide-svelte/icons/image'
	import { enhance } from '$app/forms'
	import { handleMediaFile, cleanupPreview } from '$lib/utils/mediaHandling'
	import Button from '../button/Button.svelte'

	let {
		comments = [],
		isLoggedIn,
		recipeId,
		formError = null
	}: {
		comments: {
			id: string
			content: string
			createdAt: string | Date
			imageUrl?: string | null
			user: {
				id: string
				username: string
				avatarUrl: string | null
			}
		}[]
		isLoggedIn: boolean
		onAddComment?: (content: string, imageUrl?: string) => Promise<void>
		recipeId: string
		formError?: string | null
	} = $props()

	let imagePreview = $state<string | null>(null)
	let isSubmitting = $state(false)
	let imageError = $state<string | null>(null)

	function handleImageSelect(event: Event) {
		const input = event.target as HTMLInputElement
		if (!input.files || input.files.length === 0) {
			imagePreview = null
			return
		}

		const file = input.files[0]

		if (imagePreview) {
			cleanupPreview(imagePreview)
		}
		const result = handleMediaFile(file, {
			type: 'image',
			maxSize: 5
		})

		if (result.error) {
			imageError = result.error
			return
		}

		imagePreview = result.preview
		imageError = null
	}

	function removeImage() {
		if (imagePreview) {
			cleanupPreview(imagePreview)
			imagePreview = null
		}
	}
</script>

<div class="comments-section">
	<h3 class="comments-title">
		<MessageSquare size={18} />
		Comments ({comments.length})
	</h3>

	{#if isLoggedIn}
		<form
			class="comment-form"
			method="POST"
			action="?/addComment"
			enctype="multipart/form-data"
			use:enhance
		>
			<input type="hidden" name="recipeId" value={recipeId} />

			<textarea name="content" placeholder="Add a comment..." rows="2" disabled={isSubmitting}
			></textarea>

			{#if imagePreview}
				<div class="image-preview">
					<img src={imagePreview} alt="Preview" />
					<button type="button" class="remove-image" onclick={removeImage}>×</button>
				</div>
			{/if}

			{#if formError}
				<p class="error-message">{formError}</p>
			{/if}

			{#if imageError}
				<p class="error-message">{imageError}</p>
			{/if}

			<div class="form-actions">
				<div class="image-upload">
					<label for="image-upload" class="image-upload-label" class:disabled={isSubmitting}>
						<ImageIcon size={18} />
						<span>Add Image</span>
					</label>
					<input
						type="file"
						name="image"
						id="image-upload"
						accept="image/jpeg,image/png,image/gif,image/webp"
						onchange={handleImageSelect}
						disabled={isSubmitting}
					/>
				</div>

				<Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
					{isSubmitting ? 'Posting...' : 'Post Comment'}
				</Button>
			</div>
		</form>
	{:else}
		<Popover type="warning">
			{#snippet trigger()}
				<div class="login-prompt">
					<textarea placeholder="Add a comment..." disabled></textarea>
				</div>
			{/snippet}
			{#snippet content()}
				Login to comment on recipes!
			{/snippet}
		</Popover>
	{/if}

	<div class="comments-list">
		{#if comments.length === 0}
			<div class="no-comments">
				<p>No comments yet. Be the first to comment!</p>
			</div>
		{:else}
			{#each comments as comment (comment.id)}
				<Comment
					username={comment.user.username}
					content={comment.content}
					createdAt={comment.createdAt}
					avatarUrl={comment.user.avatarUrl}
					imageUrl={comment.imageUrl}
				/>
			{/each}
		{/if}
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.comments-section {
		background-color: var(--color-neutral-darkest);
	}

	.comments-title {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: var(--font-size-md);
		color: var(--color-neutral-lightest);
		margin-top: 0;
		margin-bottom: var(--spacing-md);
		padding-bottom: var(--spacing-sm);
	}

	.comment-form {
		margin-bottom: var(--spacing-lg);
		overflow: hidden;
	}

	textarea {
		width: 100%;
		padding: var(--spacing-md);
		background-color: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--border-radius-md);
		color: var(--color-neutral-lightest);
		font-size: var(--font-size-sm);
		resize: none;
		margin-bottom: var(--spacing-sm);
		min-height: 80px;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		font-family: inherit;

		&:focus {
			outline: none;
			border-color: var(--color-primary);
			box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
		}

		&:hover:not(:disabled) {
			border-color: rgba(255, 255, 255, 0.2);
		}

		&:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}
	}

	.form-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);
	}

	.image-upload {
		position: relative;

		input[type='file'] {
			position: absolute;
			width: 0.1px;
			height: 0.1px;
			opacity: 0;
			overflow: hidden;
			z-index: -1;
		}

		.image-upload-label {
			display: flex;
			align-items: center;
			gap: var(--spacing-xs);
			padding: var(--spacing-xs) var(--spacing-sm);
			background-color: rgba(255, 255, 255, 0.1);
			border-radius: var(--border-radius-sm);
			color: var(--color-neutral-lightest);
			font-size: var(--font-size-xs);
			cursor: pointer;
			transition: all 0.2s ease;

			&:hover:not(.disabled) {
				background-color: rgba(255, 255, 255, 0.15);
			}

			&.disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}
		}
	}

	.image-preview {
		position: relative;
		margin-bottom: var(--spacing-sm);
		border-radius: var(--border-radius-md);
		overflow: hidden;
		max-width: 200px;

		img {
			max-width: 100%;
			max-height: 150px;
			object-fit: contain;
			border-radius: var(--border-radius-md);
			border: 1px solid rgba(255, 255, 255, 0.1);
		}

		.remove-image {
			position: absolute;
			top: 5px;
			right: 5px;
			width: 24px;
			height: 24px;
			border-radius: 50%;
			background-color: rgba(0, 0, 0, 0.6);
			color: white;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: var(--font-size-md);
			cursor: pointer;
			transition: all 0.2s ease;

			&:hover {
				background-color: rgba(0, 0, 0, 0.8);
			}
		}
	}

	.submit-button {
		background-color: var(--color-primary);
		color: var(--color-neutral-darkest);
		border: none;
		border-radius: var(--border-radius-md);
		padding: var(--spacing-sm) var(--spacing-lg);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: var(--font-size-sm);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

		&:hover:not(:disabled) {
			background-color: var(--color-primary-light);
			transform: translateY(-1px);
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		}

		&:active:not(:disabled) {
			transform: translateY(0);
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		}

		&:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}
	}

	.error-message {
		color: var(--color-error);
		font-size: var(--font-size-xs);
		margin: var(--spacing-xs) 0;
		padding: 0;
		text-align: left;
	}

	.comments-list {
		margin-top: var(--spacing-xl);
		clear: both;
	}

	.no-comments {
		text-align: center;
		color: var(--color-neutral-light);
		font-size: var(--font-size-sm);
		padding: var(--spacing-lg);
		background-color: rgba(255, 255, 255, 0.03);
		border-radius: var(--border-radius-md);
		border: 1px dashed rgba(255, 255, 255, 0.1);

		p {
			margin: 0;
			opacity: 0.8;
		}
	}

	.login-prompt {
		width: 100%;
		opacity: 0.7;
	}
</style>
