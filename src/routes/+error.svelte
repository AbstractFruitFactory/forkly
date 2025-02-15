<script>
	import { page } from '$app/state'
</script>

<div class="error-container">
	<h1>{page.status}: {page.error?.message}</h1>
	<p>Sorry, something went wrong.</p>
	<a href="/">Go back home</a>
</div>

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;
		padding: 1rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: #e74c3c;
	}

	p {
		margin-bottom: 1.5rem;
		color: #666;
	}

	a {
		color: #3498db;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border: 1px solid #3498db;
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	a:hover {
		background-color: #3498db;
		color: white;
	}
</style>
