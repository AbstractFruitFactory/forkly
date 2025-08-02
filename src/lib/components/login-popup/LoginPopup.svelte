<script lang="ts">
	import Popup from '$lib/components/popup/Popup.svelte'
	import GoogleButton from '$lib/components/auth-form/GoogleButton.svelte'

	let {
		isOpen = $bindable(false),
		onClose
	}: {
		isOpen?: boolean
		onClose?: () => void
	} = $props()
</script>

<Popup bind:isOpen width="400px" {onClose}>
	<div class="login-popup-content">
		<div class="message">
			<p>Please log in to access this feature.</p>
		</div>

		<div class="button-group">
			<GoogleButton />
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


</style> 