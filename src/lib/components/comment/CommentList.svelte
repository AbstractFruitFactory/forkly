<script lang="ts" module>
	export type CommentT = {
		id: string
		content: string
		createdAt: string | Date
		imageUrl?: string
		user: {
			id: string
			username: string
			avatarUrl?: string
		}
	}
</script>

<script lang="ts">
	import Comment from './Comment.svelte'
	import ImageIcon from 'lucide-svelte/icons/image'
	import { enhance } from '$app/forms'
	import { handleMediaFile, cleanupPreview } from '$lib/utils/mediaHandling'
	import Button from '../button/Button.svelte'
	import Skeleton from '../skeleton/Skeleton.svelte'
	import Input from '../input/Input.svelte'
	import { flip } from 'svelte/animate'
	import { tick } from 'svelte'
	import { fade } from 'svelte/transition'

	const COMMENTS_PER_PAGE = 10

	let {
		comments = [],
		isLoggedIn,
		recipeId,
		formError = null,
		loading = false,
		loadComments,
		total = $bindable()
	}: {
		comments: CommentT[]
		isLoggedIn: boolean
		recipeId: string
		formError?: string | null
		loading?: boolean
		loadComments: (page: number) => Promise<{ comments: CommentT[]; total: number }>
		total: number
	} = $props()

	let page = $state(0)
	let imagePreview = $state<string | null>(null)
	let isSubmitting = $state(false)
	let imageError = $state<string | null>(null)
	let commentContent = $state('')

	const totalPages = $derived(Math.max(1, Math.ceil(total / COMMENTS_PER_PAGE)))

	const handleImageSelect = async (event: Event) => {
		const input = event.target as HTMLInputElement
		if (!input.files || input.files.length === 0) {
			imagePreview = null
			return
		}

		const file = input.files[0]

		if (imagePreview) {
			cleanupPreview(imagePreview)
		}
		const result = await handleMediaFile(file, {
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

	const removeImage = () => {
		if (imagePreview) {
			cleanupPreview(imagePreview)
			imagePreview = null
		}
	}

	const onNextPage = async () => {
		if (page < totalPages - 1) {
			preventAnimate()
			page += 1
			// return if we have already loaded this page

			if (comments.length > page * COMMENTS_PER_PAGE) return

			const loadedComments = await loadComments(page)
			comments = [...comments, ...loadedComments.comments]
			total = loadedComments.total
		}
	}

	const onPrevPage = () => {
		if (page > 0) {
			preventAnimate()
			page -= 1
		}
	}

	const commentsOnCurrentPage = $derived(
		comments.slice(page * COMMENTS_PER_PAGE, (page + 1) * COMMENTS_PER_PAGE)
	)

	let preventAnimation = $state(false)

	const preventAnimate = () => {
		preventAnimation = true
		tick().then(() => {
			preventAnimation = false
		})
	}

	let shouldAnimate = $state(false)
</script>

<div class="comments-section">
	{#if isLoggedIn}
		<form
			class="comment-form"
			method="POST"
			action="?/addComment"
			enctype="multipart/form-data"
			use:enhance={async () => {
				isSubmitting = true

				return async ({ result }) => {
					isSubmitting = false

					if (result.type === 'success') {
						commentContent = ''
						if (imagePreview) {
							cleanupPreview(imagePreview)
							imagePreview = null
						}

						shouldAnimate = true

						const res = await loadComments(0)
						page = 0
						comments = res.comments
						total = res.total

						tick().then(() => {
							shouldAnimate = false
						})
					}
				}
			}}
		>
			<input type="hidden" name="recipeId" value={recipeId} />

			<Input value={commentContent}>
				{#snippet children()}
					<textarea
						name="content"
						placeholder="Add a comment..."
						rows="2"
						disabled={isSubmitting}
						bind:value={commentContent}
					></textarea>
				{/snippet}
			</Input>

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
					<label
						for="image-upload"
						class="image-upload-label"
						class:disabled={isSubmitting || loading}
					>
						<ImageIcon size={18} />
						<span>Add Image</span>
					</label>
					<input
						type="file"
						name="image"
						id="image-upload"
						accept="image/jpeg,image/png,image/gif,image/webp"
						onchange={handleImageSelect}
						disabled={isSubmitting || loading}
					/>
				</div>

				<Button type="submit" color="primary" size="sm" disabled={isSubmitting || loading}>
					{isSubmitting ? 'Posting...' : 'Post Comment'}
				</Button>
			</div>
		</form>
	{:else}
		<div class="login-prompt">
			<Input>
				{#snippet children()}
					<textarea placeholder="Add a comment..." disabled></textarea>
				{/snippet}
			</Input>
			<div class="login-overlay">
				<span>Log in to post a comment</span>
			</div>
		</div>
	{/if}

	<div class="comments-list card">
		{#if loading}
			{#each Array(3) as _, i}
				<div class="comment-skeleton">
					<div class="comment-avatar-skeleton">
						<Skeleton width="36px" height="36px" round={true} />
					</div>
					<div class="comment-content-skeleton">
						<div class="comment-header-skeleton">
							<div class="user-info-skeleton">
								<Skeleton width="120px" height="16px" />
								<Skeleton width="80px" height="12px" />
							</div>
						</div>
						<div class="comment-text-skeleton">
							<Skeleton width="100%" height="16px" />
							<Skeleton width="85%" height="16px" />
							<Skeleton width="60%" height="16px" />
						</div>
						{#if i === 0}
							<div class="comment-image-skeleton">
								<Skeleton width="200px" height="150px" />
							</div>
						{/if}
					</div>
				</div>
			{/each}
		{:else if comments.length === 0}
			<div class="no-comments">
				<p>No comments yet. Be the first to comment!</p>
			</div>
		{:else}
			{#each commentsOnCurrentPage as comment, i (comment.id)}
				<div
					animate:flip={{ duration: shouldAnimate ? 300 : 0 }}
					transition:fade={{ duration: shouldAnimate ? 1000 : 0 }}
				>
					<Comment
						username={comment.user.username}
						content={comment.content}
						createdAt={comment.createdAt}
						avatarUrl={comment.user.avatarUrl}
						imageUrl={comment.imageUrl}
					/>
					{#if i < comments.length - 1}
						<div class="comments-divider divider"></div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>

	{#if totalPages > 1}
		<div class="pagination">
			<Button onclick={onPrevPage} disabled={page === 0}>Previous</Button>
			<span class="page-info">Page {page + 1} of {totalPages}</span>
			<Button onclick={onNextPage} disabled={page === totalPages - 1}>Next</Button>
		</div>
	{/if}
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.comments-section {
		background-color: var(--color-neutral-darkest);
	}
	.comment-form {
		margin-bottom: var(--spacing-lg);
		overflow: hidden;
	}

	.comment-form :global(.input-container) {
		margin-bottom: var(--spacing-sm);
		min-height: 80px;
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
			color: var(--color-text-on-surface);
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

	.comments-divider {
		margin-bottom: var(--spacing-lg);
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
		position: relative;
		cursor: not-allowed;

		&:hover .login-overlay {
			opacity: 1;
			visibility: visible;
		}
	}

	.login-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(255, 255, 255, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-2xl);
		opacity: 0;
		visibility: hidden;
		transition: all 0.2s ease;
		z-index: 10;

		span {
			color: var(--color-neutral-darkest);
			font-size: var(--font-size-sm);
			font-weight: var(--font-weight-medium);
			text-align: center;
			padding: var(--spacing-sm);
		}
	}

	.comment-skeleton {
		display: flex;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background-color: rgba(255, 255, 255, 0.03);
		margin-bottom: var(--spacing-sm);
		border-radius: var(--border-radius-md);
	}

	.comment-avatar-skeleton {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
	}

	.comment-content-skeleton {
		flex: 1;
		min-width: 0;
	}

	.comment-header-skeleton {
		margin-bottom: var(--spacing-xs);
	}

	.user-info-skeleton {
		display: flex;
		align-items: baseline;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
	}

	.comment-text-skeleton {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.comment-image-skeleton {
		margin-top: var(--spacing-sm);
	}

	.pagination {
		display: flex;
		justify-content: space-between;
		margin-top: var(--spacing-lg);
	}

	.page-info {
		display: flex;
		align-items: center;
	}
</style>
