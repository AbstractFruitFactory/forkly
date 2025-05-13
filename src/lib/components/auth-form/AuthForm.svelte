<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'
	import Input from '$lib/components/input/Input.svelte'
	import { enhance } from '$app/forms'
	import GoogleIcon from '$lib/components/icons/GoogleIcon.svelte'

	let {
		mode = 'login',
		error,
		alternateHref
	}: {
		mode?: 'login' | 'signup'
		error?: string
		alternateHref: string
	} = $props()

	let loading = $state(false)

	const title = mode === 'login' ? 'Login' : 'Sign Up'
	const submitText = mode === 'login' ? 'Login' : 'Sign Up'
	const alternateText = mode === 'login' ? "Don't have an account?" : 'Already have an account?'
	const alternateLinkText = mode === 'login' ? 'Register' : 'Login'
</script>

<div class="auth-container">
	<div class="auth-box">
		<h1>{title}</h1>
		<form method="POST" use:enhance>
			<div class="form-group">
				<label for="username">Username</label>
				<Input>
					<input id="username" name="username" type="text" placeholder="Enter username" required />
				</Input>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<Input>
					<input
						id="password"
						name="password"
						type="password"
						placeholder="Enter password"
						required
					/>
				</Input>
			</div>

			{#if mode === 'signup'}
				<div class="form-group">
					<label for="email">Email</label>
					<Input>
						<input id="email" name="email" type="email" placeholder="Enter email" required />
					</Input>
				</div>
			{/if}

			{#if error}
				<p class="error">{error}</p>
			{/if}

			<Button type="submit" fullWidth disabled={loading}>
				{loading ? `${submitText}...` : submitText}
			</Button>

			{#if mode === 'login'}
				<a href="/login/google" style="display: block; margin-top: 1rem; text-align: center;">
					<button
						type="button"
						style="width: 100%; padding: 0.75em; border-radius: 4px; border: 1px solid #ccc; background: #fff; color: #333; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5em;"
					>
						<GoogleIcon />
						Sign in with Google
					</button>
				</a>
			{/if}
		</form>

		<p class="alternate-link">
			{alternateText}
			<Button variant="text" href={alternateHref}>{alternateLinkText}</Button>
		</p>
	</div>
</div>

<style lang="scss">
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - var(--spacing-2xl));
		padding: var(--spacing-lg);
	}

	.auth-box {
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

	.error {
		color: var(--color-error);
		margin: var(--spacing-xs) 0;
		text-align: center;
	}

	.alternate-link {
		margin-top: var(--spacing-md);
		text-align: center;
		color: var(--color-neutral);
	}

	.alternate-link a {
		color: var(--color-primary);
		text-decoration: none;
	}

	.alternate-link a:hover {
		text-decoration: underline;
	}
</style>
