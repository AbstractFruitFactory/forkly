<script lang="ts">
	import Comment from './Comment.svelte'
	import type { RecipeComment } from '$lib/server/db/schema'
	import { page } from '$app/state'
	import Popover from '$lib/components/popover/Popover.svelte'
	import MessageSquare from 'lucide-svelte/icons/message-square'

	let {
		comments = [],
		isLoggedIn,
		onAddComment
	}: {
		comments: {
			id: string
			content: string
			createdAt: string | Date
			user: {
				id: string
				username: string
				avatarUrl: string | null
			}
		}[]
		isLoggedIn: boolean
		onAddComment: (content: string) => Promise<void>
	} = $props()

	let newComment = $state('')
	let isSubmitting = $state(false)
	let error = $state('')

	async function handleSubmit() {
		if (!newComment.trim()) {
			error = 'Comment cannot be empty'
			return
		}

		try {
			isSubmitting = true
			await onAddComment(newComment.trim())
			newComment = ''
			error = ''
		} catch (err) {
			error = 'Failed to add comment'
			console.error(err)
		} finally {
			isSubmitting = false
		}
	}
</script>

<div class="comments-section">
	<h3 class="comments-title">
		<MessageSquare size={18} />
		Comments ({comments.length})
	</h3>

	{#if isLoggedIn}
		<form class="comment-form" on:submit|preventDefault={handleSubmit}>
			<textarea
				bind:value={newComment}
				placeholder="Add a comment..."
				rows="2"
				disabled={isSubmitting}
			></textarea>
			{#if error}
				<p class="error-message">{error}</p>
			{/if}
			<button type="submit" class="submit-button" disabled={isSubmitting}>
				{isSubmitting ? 'Posting...' : 'Post Comment'}
			</button>
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
				/>
			{/each}
		{/if}
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.comments-section {
		padding: var(--spacing-md);
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

	.submit-button {
		background-color: var(--color-primary);
		color: var(--color-neutral-darkest);
		border: none;
		border-radius: var(--border-radius-md);
		padding: var(--spacing-sm) var(--spacing-lg);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all 0.2s ease;
		float: right;
		font-size: var(--font-size-sm);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		margin-bottom: var(--spacing-md);

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
		margin: 0 0 var(--spacing-sm) 0;
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
