<script lang="ts">
	import { safeFetch } from '$lib/utils/fetch'
	import Popup from '../popup/Popup.svelte'
	import Button from '../button/Button.svelte'
	import Input from '../input/Input.svelte'
	import ThankYou from './ThankYou.svelte'

	let {
		isOpen = $bindable(false),
		onClose
	}: {
		isOpen?: boolean
		onClose?: () => void
	} = $props()

	let feedbackText = $state('')
	let email = $state('')
	let isSubmitting = $state(false)
	let submitSuccess = $state(false)
	let submitError = $state('')

	const handleSubmit = async () => {
		if (!feedbackText.trim()) {
			submitError = 'Please enter your feedback'
			return
		}

		isSubmitting = true
		submitError = ''

		try {
			const response = await safeFetch()('/feedback', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					text: feedbackText.trim(),
					email: email.trim() || undefined
				})
			})

			if (response.isOk()) {
				submitSuccess = true

				setTimeout(() => {
					handleClose()
				}, 4000)
			} else {
				submitError = 'Failed to submit feedback. Please try again.'
			}
		} catch (error) {
			submitError = 'Failed to submit feedback. Please try again.'
		} finally {
			isSubmitting = false
		}
	}

	const handleClose = () => {
		if (!isSubmitting) {
			isOpen = false
			onClose?.()
			// Reset form
			setTimeout(() => {
				feedbackText = ''
				email = ''
				submitSuccess = false
				submitError = ''
			}, 300)
		}
	}
</script>

<Popup
	{isOpen}
	title="💬 Send Feedback"
	onClose={handleClose}
	closeOnClickOutside={true}
	width="500px"
>
	{#if submitSuccess}
		<ThankYou />
	{:else}
		<form
			class="feedback-form"
			onsubmit={(e) => {
				e.preventDefault()
				handleSubmit()
			}}
		>
			<div class="form-group">
				<label for="feedback-text" class="form-label">
					Your Feedback <span class="required">*</span>
				</label>
				<Input value={feedbackText}>
					<textarea
						id="feedback-text"
						bind:value={feedbackText}
						placeholder="Tell us what you think, report a bug, or suggest a feature..."
						rows="5"
						disabled={isSubmitting}
						required
					></textarea>
				</Input>
			</div>

			<div class="form-group">
				<label for="feedback-email" class="form-label">Email (Optional)</label>
				<Input value={email}>
					<input
						type="email"
						id="feedback-email"
						bind:value={email}
						placeholder="your@email.com"
						disabled={isSubmitting}
					/>
				</Input>
				<p class="form-help">We'll only use this to follow up on your feedback</p>
			</div>

			{#if submitError}
				<div class="error-message">
					<p>{submitError}</p>
				</div>
			{/if}

			<div class="form-actions">
				<Button variant="border" color="neutral" onclick={handleClose} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button
					color="primary"
					onclick={handleSubmit}
					disabled={isSubmitting}
					loading={isSubmitting}
				>
					{isSubmitting ? 'Sending...' : 'Send Feedback'}
				</Button>
			</div>
		</form>
	{/if}
</Popup>

<style lang="scss">
	@import '$lib/global.scss';

	.feedback-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.form-label {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-on-surface);
	}

	.required {
		color: var(--color-error);
	}

	.form-select {
		width: 100%;
		padding: var(--spacing-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--border-radius-md);
		background: var(--color-background);
		color: var(--color-text-on-surface);
		font-size: var(--font-size-md);
		transition: border-color var(--transition-fast) var(--ease-in-out);

		&:focus {
			outline: none;
			border-color: var(--color-primary);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.form-help {
		font-size: var(--font-size-sm);
		color: var(--color-text-on-surface);
		opacity: 0.7;
		margin: 0;
	}

	.error-message {
		background: var(--color-error-light);
		border: 1px solid var(--color-error);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-md);

		p {
			color: var(--color-error);
			margin: 0;
			font-size: var(--font-size-sm);
		}
	}

	.form-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: flex-end;
		margin-top: var(--spacing-lg);

		@include mobile {
			flex-direction: column;
		}
	}

	:global(.feedback-form textarea) {
		resize: vertical;
		min-height: 120px;
		font-family: inherit;
	}
</style>
