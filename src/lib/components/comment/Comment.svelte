<script lang="ts">
	import { formatDistanceToNow } from 'date-fns'
	import ProfilePic from '../profile-pic/ProfilePic.svelte'
	import TruncatedText from '../truncated-text/TruncatedText.svelte'

	let {
		username,
		content,
		createdAt,
		avatarUrl,
		imageUrl
	}: {
		username: string
		content: string
		createdAt: string | Date
		avatarUrl?: string
		imageUrl?: string
	} = $props()

	function formatDate(date: string | Date): string {
		const dateObj = typeof date === 'string' ? new Date(date) : date
		return formatDistanceToNow(dateObj, { addSuffix: true })
	}
</script>

<div class="comment">
	<ProfilePic profilePicUrl={avatarUrl} background={true} />

	<div class="comment-content">
		<div class="comment-header">
			<div class="user-info">
				<span class="username">{username}</span>
				<span class="timestamp">{formatDate(createdAt)}</span>
			</div>
		</div>
		<p class="comment-text">
			<TruncatedText text={content} maxLength={300} />
		</p>
		{#if imageUrl}
			<div class="comment-image">
				<img src={imageUrl} alt="Comment attachment" />
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.comment {
		display: flex;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		background-color: var(--color-surface);
		margin-bottom: var(--spacing-sm);
		border-radius: var(--border-radius-md);
	}

	.comment-content {
		flex: 1;
		min-width: 0; /* Ensures text truncation works properly */
	}

	.comment-header {
		margin-bottom: var(--spacing-xs);
	}

	.user-info {
		display: flex;
		align-items: baseline;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
	}

	.username {
		font-weight: var(--font-weight-semibold);
		color: var(--color-neutral-lightest);
		font-size: var(--font-size-sm);
	}

	.timestamp {
		font-size: var(--font-size-xs);
		color: var(--color-neutral-light);
		opacity: 0.8;
	}

	.comment-text {
		margin: 0;
		font-size: var(--font-size-sm);
		word-break: break-word;
	}

	.comment-image {
		margin-top: var(--spacing-sm);
		border-radius: var(--border-radius-md);
		overflow: hidden;
		max-width: 100%;

		img {
			max-width: 100%;
			max-height: 300px;
			object-fit: contain;
			border-radius: var(--border-radius-md);
			border: 1px solid rgba(255, 255, 255, 0.1);
		}
	}
</style>
