<script>
	import { onMount } from 'svelte'
	import { confetti } from '@tsparticles/confetti'

	onMount(async () => {
		await confetti({
			particleCount: 30,
			spread: 200,
			startVelocity: 30,
			gravity: 0.5,
			ticks: 300,
			shapes: ['heart'],
			colors: ['#ff6b6b', '#ff8e8e', '#ffb3b3', '#ffd6d6'],
			scalar: 8,
			origin: {
				x: 0.5,
				y: 0.5
			},
      flat: true,
      zIndex: 2000,
		})
	})
</script>

<div class="success-message">
	<div class="success-icon">❤️</div>
	<h3>Thank you!</h3>
	<p>Your feedback has been submitted successfully.</p>
</div>

<style lang="scss">
	:global(#confetti) {
		pointer-events: none !important;
    z-index: 1000 !important;
    position: fixed;
	}

	.success-message {
		padding: var(--spacing-2xl);
		text-align: center;

		.success-icon {
			font-size: var(--font-size-3xl);
			margin-bottom: var(--spacing-md);
		}

		h3 {
			font-size: var(--font-size-xl);
			font-weight: 600;
			color: var(--color-text-on-surface);
			margin: 0 0 var(--spacing-sm) 0;
		}

		p {
			color: var(--color-text-on-surface);
			opacity: 0.8;
			margin: 0;
		}
	}
</style>
