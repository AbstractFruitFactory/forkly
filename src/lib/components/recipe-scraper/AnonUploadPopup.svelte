<script lang="ts">
	import Popup from '$lib/components/popup/Popup.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import { goto } from '$app/navigation'

	let {
		isOpen = $bindable(false),
		onClose,
		onUploadAnonymously,
		createRecipe
	}: {
		isOpen?: boolean
		onClose?: () => void
		onUploadAnonymously?: () => void
		createRecipe?: any
	} = $props()

	function handleClose() {
		isOpen = false
		onClose?.()
	}

	function handleUploadAnonymously() {
		onUploadAnonymously?.()
		handleClose()
	}

	function handleLogin() {
		goto('/login')
		handleClose()
	}
</script>

<Popup bind:isOpen width="500px" {onClose}>
	<div class="login-popup-content">
		<div class="warning-message">
			<p>
				You are uploading <b>anonymously</b>, and won't be able to edit or delete the recipe later.
				To make changes, you have to create an account.
			</p>
		</div>

		<div class="button-group">
			<Button color="primary" onclick={handleLogin} fullWidth>Log In</Button>
			<Button
				color="neutral"
				type="submit"
				formaction="?/createRecipe"
				onclick={handleUploadAnonymously}
				fullWidth
			>
				Upload Anonymously
			</Button>
		</div>
	</div>
</Popup>

<style lang="scss">
	@import '$lib/global.scss';

	.login-popup-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.warning-message {
		background-color: var(--color-warning-light);
		border: 1px solid var(--color-warning);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		text-align: center;

		p {
			margin: 0;
			color: var(--color-text-on-surface);
			font-size: var(--font-size-md);
			line-height: 1.5;
		}
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);

		@include tablet-desktop {
			flex-direction: row;
			justify-content: flex-end;
		}
	}
</style>
