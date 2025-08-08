<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'
	import { onMount } from 'svelte'
	import { confetti } from '@tsparticles/confetti'

	let { recipeId }: { recipeId: string } = $props()
	let successIconElement: HTMLElement

	onMount(async () => {
		await new Promise((resolve) => setTimeout(resolve, 500))
		const rect = successIconElement.getBoundingClientRect()
		const centerX = rect.left + rect.width / 2
		const centerY = rect.top + rect.height / 2

		await confetti({
			particleCount: 100,
			spread: 90,
			startVelocity: 30,
			origin: {
				x: centerX / window.innerWidth,
				y: centerY / window.innerHeight
			},
			gravity: 0.8,
			ticks: 500,
		})
	})
</script>

<div class="success-container">
	<div class="success-content card">
		<div class="success-icon" bind:this={successIconElement}>🎉</div>
		<h1>Recipe Created!</h1>
		<p>Your recipe has been successfully created.</p>
		<div class="button-group">
			<Button href="/recipe/{recipeId}" fullWidth color="primary">View Recipe</Button>
			<Button href="/new" fullWidth color="neutral" variant="border">Create Another</Button>
			<Button href="/" fullWidth color="neutral" variant="border">Go Home</Button>
		</div>
	</div>
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	// Make confetti canvas non-interactive
	:global(#confetti canvas) {
		pointer-events: none !important;
	}

	.success-container {
		display: flex;
		justify-content: center;
		margin-top: 200px;

		@include mobile {
			height: calc(100dvh - 6.5rem);
			align-items: center;
			padding: var(--spacing-md);
			margin-top: 0;
		}
	}

	.success-content {
		text-align: center;
		max-width: 500px;
		width: 100%;
	}

	.success-icon {
		font-size: var(--spacing-2xl);
		color: var(--color-success);
		margin-bottom: var(--spacing-md);
	}

	h1 {
		font-family: var(--font-sans);
	}

	p {
		color: var(--color-neutral);
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		max-width: 300px;
		margin: 0 auto;
	}

	@media (max-width: 640px) {
		.success-content {
			padding: var(--spacing-lg);
		}
	}
</style>
