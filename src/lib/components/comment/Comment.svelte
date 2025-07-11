<script lang="ts">
	import { formatDistanceToNow } from 'date-fns'

	let {
		username,
		content,
		createdAt,
		avatarUrl = null,
		imageUrl = null
	}: {
		username: string
		content: string
		createdAt: string | Date
		avatarUrl: string | null
		imageUrl?: string | null
	} = $props()

	function formatDate(date: string | Date): string {
		const dateObj = typeof date === 'string' ? new Date(date) : date
		return formatDistanceToNow(dateObj, { addSuffix: true })
	}
</script>

<div class="comment">
	<div class="comment-avatar">
		{#if avatarUrl}
			<img src={avatarUrl} alt={username} />
		{:else}
			<div class="avatar-placeholder">{username[0].toUpperCase()}</div>
		{/if}
	</div>
	<div class="comment-content">
		<div class="comment-header">
			<div class="user-info">
				<span class="username">{username}</span>
				<span class="timestamp">{formatDate(createdAt)}</span>
			</div>
		</div>
		<p class="comment-text">{content}</p>
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
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background-color: rgba(255, 255, 255, 0.03);
		margin-bottom: var(--spacing-sm);
		border-radius: var(--border-radius-md);
	}

	.comment-avatar {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.avatar-placeholder {
			width: 100%;
			height: 100%;
			background-color: var(--color-primary-dark);
			color: var(--color-neutral-lightest);
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: var(--font-weight-bold);
			font-size: var(--font-size-md);
		}
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
