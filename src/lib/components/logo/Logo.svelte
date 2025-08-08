<script lang="ts">
	import ForklyLogo from '$lib/images/logo.svg'

	let { href = '/', responsive = true }: { href?: string; responsive?: boolean } = $props()
</script>

<div class="logo">
	<a {href} class:logo-desktop={responsive}><img src={ForklyLogo} alt="Forkly Logo" /></a>
	{#if responsive}
		<a {href} class:logo-mobile={responsive}>F</a>
	{/if}
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	$logo-height: 45px;

	.logo {
		height: $logo-height;
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
		img {
			height: $logo-height;
		}
	}
</style>
