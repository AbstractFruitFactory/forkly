<script lang="ts">
	let { href = '/' }: { href?: string } = $props()
</script>

<div class="logo">
	<a {href} class="logo-desktop">Forkly</a>
	<a {href} class="logo-mobile">F</a>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.logo {
		display: inline-block;

		&-desktop {
			display: block;
			@include mobile {
				display: none;
			}
		}
		&-mobile {
			display: none;
			@include mobile {
				display: block;
				width: 24px;
			}
		}
		a {
			font-family: 'Pacifico', cursive;
			font-size: var(--font-size-3xl);
			text-decoration: none;
			font-weight: 500;
			transition: opacity var(--transition-fast) var(--ease-in-out);
			white-space: nowrap;
			color: black;
			@include mobile {
				font-size: var(--font-size-2xl);
			}
		}
	}
</style>
