<script lang="ts">
	export let width: string | number = '100%'
	export let height: string | number = '1rem'
</script>

<div class="skeleton" style="width:{width};height:{height};"></div>

<style lang="scss">
	@import '$lib/global.scss';
	.skeleton {
		position: relative;
		overflow: hidden;
		background: var(--color-neutral-darker);
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
