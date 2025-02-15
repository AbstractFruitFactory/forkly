<script lang="ts">
	import { enhance } from '$app/forms'

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

			<button type="submit">Login</button>
		</form>

		<p class="register-link">
			Don't have an account? <a href="/register">Register</a>
		</p>
	</div>
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 80px);
		padding: 2rem;
	}

	.login-box {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
	}

	h1 {
		margin: 0 0 1.5rem;
		text-align: center;
		color: #333;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #555;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	input:focus {
		outline: none;
		border-color: #3498db;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		background: #3498db;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	button:hover {
		background: #2980b9;
	}

	.error {
		color: #e74c3c;
		margin: 0.5rem 0;
		text-align: center;
	}

	.register-link {
		margin-top: 1rem;
		text-align: center;
		color: #666;
	}

	.register-link a {
		color: #3498db;
		text-decoration: none;
	}

	.register-link a:hover {
		text-decoration: underline;
	}
</style>
