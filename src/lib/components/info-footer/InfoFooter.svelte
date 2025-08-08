<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside'
	import { Info } from 'lucide-svelte/icons'
	import { slide } from 'svelte/transition'
	import FeedbackForm from '../feedback-form/FeedbackForm.svelte'

	let {
		fixed = false
	}: {
		fixed?: boolean
	} = $props()

	let isDrawerOpen = $state(false)
	let isFeedbackOpen = $state(false)

	const handleInfoClick = () => {
		isDrawerOpen = true
	}

	const handleClose = () => {
		isDrawerOpen = false
	}

	const handleFeedbackClick = () => {
		isFeedbackOpen = true
		isDrawerOpen = false
	}

	const handleFeedbackClose = () => {
		isFeedbackOpen = false
	}
</script>

<div class="info-footer" class:fixed>
	<button class="info-button" onclick={handleInfoClick} aria-label="Show information">
		<Info size={25} />
	</button>
</div>

{#if isDrawerOpen}
	<div
		use:clickOutside={{ callback: handleClose }}
		class="info-panel"
		transition:slide={{ duration: 300, axis: 'y' }}
	>
		<div class="info-header">
			<div></div>
			<button class="info-close" onclick={handleClose} aria-label="Close">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>
		<div class="info-content">
			<div class="info-section">
				<div class="section-links">
					<a href="/about" class="info-link">
						<span class="link-icon">📄</span>
						<span class="link-text">About</span>
					</a>
					<a href="/terms" class="info-link">
						<span class="link-icon">📋</span>
						<span class="link-text">Terms of Use</span>
					</a>
					<a href="/privacy" class="info-link">
						<span class="link-icon">🔒</span>
						<span class="link-text">Privacy Policy</span>
					</a>
					<a href="mailto:hello@forkly.me" class="info-link">
						<span class="link-icon">✉️</span>
						<span class="link-text">Support</span>
					</a>
				</div>
			</div>

			<div class="info-section">
				<div class="section-content">
					<button class="feedback-button" onclick={handleFeedbackClick}>
						<span class="button-icon">💬</span>
						<span class="button-text">Send Feedback</span>
					</button>
					<p class="built-with">Built with ❤️ using SvelteKit</p>
				</div>
			</div>

			<p class="copyright">© 2025 Forkly</p>
		</div>
	</div>
{/if}

<FeedbackForm isOpen={isFeedbackOpen} onClose={handleFeedbackClose} />

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.info-footer {
		z-index: calc(var(--z-dropdown) + 100);
		pointer-events: none;
	}

	.fixed {
		position: fixed;
		bottom: var(--spacing-lg);
		right: var(--spacing-lg);

		@include mobile {
			bottom: 80px
		}
	}

	.info-button {
		background: var(--color-primary-light);
		border: none;
		border-radius: 50%;
		aspect-ratio: 1/1;
		width: 60px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-sm);
		transition:
			background-color var(--transition-fast) var(--ease-in-out),
			transform var(--transition-fast) var(--ease-in-out);
		pointer-events: auto;
		touch-action: manipulation;

		&:hover {
			background-color: var(--color-primary);
			transform: scale(1.05);
		}

		&:active {
			transform: scale(0.95);
		}
	}

	.info-panel {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: var(--color-surface);
		width: 100%;
		max-height: 80vh;
		border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		z-index: var(--z-modal);
		box-shadow: var(--shadow-lg);
	}

	.info-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-sm);
		border-bottom: 1px solid var(--color-border);
	}

	.info-title {
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-on-surface);
	}

	.info-close {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: var(--spacing-xs);
		color: var(--color-neutral);
		border-radius: var(--border-radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background-color var(--transition-fast) var(--ease-in-out),
			color var(--transition-fast) var(--ease-in-out);

		&:hover {
			background-color: var(--color-hover);
			color: var(--color-primary);
		}
	}

	.info-content {
		padding: var(--spacing-lg);
		overflow-y: auto;
		flex: 1;
	}

	.info-section {
		margin-bottom: var(--spacing-2xl);

		&:last-child {
			margin-bottom: 0;
		}
	}

	.section-links {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);

		@include desktop {
			display: flex;
			flex-direction: row;
			gap: var(--spacing-md);
			justify-content: center;
			flex-wrap: wrap;
		}
	}

	.info-link {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		color: var(--color-text-on-surface);
		text-decoration: none;
		padding: var(--spacing-md);
		border-radius: var(--border-radius-lg);
		background: var(--color-background);
		transition: all var(--transition-fast) var(--ease-in-out);
		border: 1px solid var(--color-border);

		@include desktop {
			flex-direction: row;
			align-items: center;
			justify-content: center;
			text-align: center;
			gap: var(--spacing-sm);
			padding: var(--spacing-sm) var(--spacing-md);
			min-width: auto;
			aspect-ratio: auto;
		}

		&:hover {
			background: var(--color-primary);
			color: var(--color-text-on-primary);
			transform: translateY(-2px);
			box-shadow: var(--shadow-md);
		}
	}

	.link-icon {
		font-size: var(--font-size-lg);
		width: 24px;
		text-align: center;

		@include desktop {
			font-size: var(--font-size-lg);
			width: auto;
		}
	}

	.link-text {
		font-weight: 500;
		font-size: var(--font-size-md);

		@include desktop {
			font-size: var(--font-size-md);
		}
	}

	.section-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		align-items: center;
		text-align: center;
	}

	.copyright {
		margin: 0;
		color: var(--color-text-on-surface);
		font-size: var(--font-size-sm);
		font-weight: 500;
		opacity: 0.8;
		text-align: right;
	}

	.feedback-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		background: var(--color-primary);
		border: none;
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-md) var(--spacing-lg);
		cursor: pointer;
		font-size: var(--font-size-md);
		font-weight: 500;
		transition: all var(--transition-fast) var(--ease-in-out);
		box-shadow: var(--shadow-sm);

		.button-text {
			color: var(--color-text-on-primary);
		}

		&:hover {
			background-color: var(--color-primary-dark);
			transform: translateY(-2px);
			box-shadow: var(--shadow-md);
		}

		&:active {
			transform: translateY(0);
		}
	}

	.button-icon {
		font-size: var(--font-size-lg);
	}

	.button-text {
		font-weight: 500;
	}

	.built-with {
		margin: 0;
		color: var(--color-text-on-surface);
		font-size: var(--font-size-sm);
		opacity: 0.7;
		font-style: italic;
	}
</style>
