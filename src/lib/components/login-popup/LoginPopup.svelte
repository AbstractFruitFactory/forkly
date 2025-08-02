<script lang="ts">
	import Popup from '$lib/components/popup/Popup.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import GoogleIcon from '$lib/components/icons/GoogleIcon.svelte'

	let {
		isOpen = $bindable(false),
		onClose
	}: {
		isOpen?: boolean
		onClose?: () => void
	} = $props()

	function handleClose() {
		isOpen = false
		onClose?.()
	}
</script>

<Popup bind:isOpen width="400px" {onClose}>
	<div class="login-popup-content">
		<div class="message">
			<p>Please log in to access this feature.</p>
		</div>

		<div class="button-group">
			<a href="/login/google" class="google-button">
				<button type="button" class="google-button-inner">
					<GoogleIcon />
					Sign in with Google
				</button>
			</a>
		</div>
	</div>
</Popup>

<style lang="scss">
	@import '$lib/global.scss';

	.login-popup-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
		text-align: center;
	}

	.message {
		p {
			margin: 0;
			color: var(--color-text-on-surface);
			font-size: var(--font-size-lg);
			line-height: 1.5;
		}
	}

	.button-group {
		display: flex;
		justify-content: center;
	}

	.google-button {
		text-decoration: none;
		width: 100%;

		.google-button-inner {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: var(--spacing-sm);
			width: 100%;
			padding: var(--spacing-md) var(--spacing-lg);
			background: var(--color-surface);
			border: 1px solid var(--color-border);
			border-radius: var(--border-radius-lg);
			color: var(--color-text-on-surface);
			font-size: var(--font-size-md);
			font-weight: var(--font-weight-medium);
			cursor: pointer;
			transition: all 0.2s ease;

			&:hover {
				background: var(--color-surface-hover);
				border-color: var(--color-border-hover);
			}

			&:active {
				transform: translateY(1px);
			}
		}
	}
</style> 