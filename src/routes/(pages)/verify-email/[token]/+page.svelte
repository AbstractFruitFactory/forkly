<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'

	let { data } = $props()

	onMount(() => {
		if (data.verification.success) {
			setTimeout(() => goto('/'), 2000)
		}
	})
</script>

<div class="verify-email-container">
	<h1>{data.verification.success ? 'Email Verified' : 'Verification Failed'}</h1>
	<p>{data.verification.message}</p>
</div>

<style>
	.verify-email-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
	}
	h1 {
		font-family: 'Inter', sans-serif;
	}
</style>
