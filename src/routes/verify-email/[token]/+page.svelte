<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	let { data }: { data: { success: boolean; message: string } } = $props()

	onMount(() => {
		if (data.success) setTimeout(() => goto('/'), 2000)
	})
</script>

<div class="verify-email-container">
	<h1>{data.success ? 'Email Verified' : 'Verification Failed'}</h1>
	<p>{data.message}</p>
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
		margin-bottom: 1rem;
	}
	p {
		font-size: 1.1rem;
	}
</style>
