<script lang="ts">
	let { width = '100%', height = '1rem', round = false }: { width?: string; height?: string; round?: boolean } = $props()
</script>

<div class="skeleton" class:round style:width style:height></div>

<style lang="scss">
	@import '$lib/global.scss';
	.skeleton {
		position: relative;
		overflow: hidden;
		background: var(--color-neutral-darker);
	}
	.skeleton.round {
		border-radius: 50%;
	}
	.skeleton::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.05) 0%,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.15) 50%,
			rgba(255, 255, 255, 0.1) 75%,
			rgba(255, 255, 255, 0.05) 100%
		);
		background-size: 200% 100%;
		animation: skeleton-shift 1.5s ease-in-out infinite;
	}
	@keyframes skeleton-shift {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>
