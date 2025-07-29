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

	let title = $derived(mode === 'login' ? 'Login' : 'Sign Up')
	let submitText = $derived(mode === 'login' ? 'Login' : 'Sign Up')
	let alternateText = $derived(
		mode === 'login' ? "Don't have an account?" : 'Already have an account?'
	)
	let alternateLinkText = $derived(mode === 'login' ? 'Register' : 'Login')
</script>

<div class="auth-form card">
	<div class="title">{title}</div>
	<form method="POST" use:enhance>
		<div class="form-group">
			<label for="username">Username</label>
			<Input --background="white">
				<input id="username" name="username" type="text" placeholder="Enter username" required />
			</Input>
		</div>

		<div class="form-group">
			<label for="password">Password</label>
			<Input --background="white">
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
				<Input --background="white">
					<input id="email" name="email" type="email" placeholder="Enter email" required />
				</Input>
			</div>
		{/if}

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<Button color="primary" type="submit" fullWidth disabled={loading}>
			{loading ? `${submitText}...` : submitText}
		</Button>

		{#if mode === 'login'}
			<a href="/login/google" class="google-button">
				<button type="button" class="google-button-inner">
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

<style lang="scss">
	.auth-form {
		width: 100%;
		max-width: 400px;
	}

	.title {
		margin: 0 0 var(--spacing-xl);
		text-align: center;
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-bold);
	}

	.form-group {
		margin-bottom: var(--spacing-md);
	}

	label {
		display: block;
		margin-bottom: var(--spacing-xs);
	}

	.google-button {
		display: block;
		margin-top: var(--spacing-md);
		text-align: center;

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
