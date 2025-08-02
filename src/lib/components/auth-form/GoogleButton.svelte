<script lang="ts">
	import GoogleIcon from '$lib/components/icons/GoogleIcon.svelte'
</script>

<a href="/login/google" class="google-button">
	<button type="button" class="google-button-inner">
		<GoogleIcon />
		Sign in with Google
	</button>
</a>

<style lang="scss">
	.google-button {
		display: block;
		margin-top: var(--spacing-md);
		text-align: center;
		text-decoration: none;
		width: 100%;

		.google-button-inner {
			width: 100%;
			padding: 0.75em;
			border-radius: 4px;
			border: 1px solid #ccc;
			background: #fff;
			color: #333;
			font-weight: 500;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5em;
			border-radius: var(--border-radius-2xl);
		}
	}
</style> 