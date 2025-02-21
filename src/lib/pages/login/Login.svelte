<script lang="ts">
	import { enhance } from '$app/forms'
	import Button from '$lib/components/button/Button.svelte'

	let { message }: { message?: string } = $props()
</script>

<div class="login-container">
	<div class="login-box">
		<h1>Login</h1>
		<form method="POST" action="?/login" use:enhance>
			<div class="form-group">
				<label for="username">Username</label>
				<input id="username" name="username" type="text" required />
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input id="password" name="password" type="password" required />
			</div>

			{#if message}
				<p class="error">{message}</p>
			{/if}

			<Button type="submit" fullWidth>Login</Button>
		</form>

		<p class="register-link">
			Don't have an account? <Button variant="text" href="/register">Register</Button>
		</p>
	</div>
</div>

<style lang="scss">
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - var(--spacing-2xl));
		padding: var(--spacing-lg);
	}

	.login-box {
		background: var(--color-neutral-dark);
		padding: var(--spacing-lg);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-md);
		width: 100%;
		max-width: 400px;
	}

	h1 {
		margin: 0 0 var(--spacing-xl);
		text-align: center;
	}

	.form-group {
		margin-bottom: var(--spacing-md);
	}

	label {
		display: block;
		margin-bottom: var(--spacing-xs);
	}

	input {
		width: 100%;
		padding: var(--spacing-sm);
		border: var(--border-width-thin) solid var(--color-neutral);
		border-radius: var(--border-radius-md);
		font-size: var(--spacing-md);
	}

	input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.error {
		color: var(--color-error);
		margin: var(--spacing-xs) 0;
		text-align: center;
	}

	.register-link {
		margin-top: var(--spacing-md);
		text-align: center;
		color: var(--color-neutral);
	}

	.register-link a {
		color: var(--color-primary);
		text-decoration: none;
	}

	.register-link a:hover {
		text-decoration: underline;
	}
</style>
