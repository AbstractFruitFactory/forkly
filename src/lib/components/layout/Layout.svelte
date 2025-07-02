<script lang="ts">
	import { onMount, type Snippet } from 'svelte'
	import { scrollStore } from '$lib/state/scroll.svelte'
	import { slide } from 'svelte/transition'

	let {
		header,
		content,
		homepage = false,
		wideHeader = false,
		homepageHeader,
		homepageHeaderTransition = true,
		bottomNavBar
	} = $props<{
		header: Snippet
		content: Snippet
		homepage?: boolean
		wideHeader?: boolean
		homepageHeader?: Snippet
		homepageHeaderTransition?: boolean
		bottomNavBar?: Snippet
	}>()

	let mainElement: HTMLElement

	onMount(() => {
		scrollStore.setScrollContainer(mainElement)
	})
</script>

<div class="layout" class:homepage>
	<header class="header page-padding" class:homepage class:wide-header={wideHeader}>
		<div
			class="header-background"
			class:transparent={homepage && wideHeader}
			class:border={!homepage}
		></div>
		{@render header()}
	</header>

	<main class="main" class:homepage bind:this={mainElement}>
		{#if homepage}
			<div
				class="homepage-header"
				transition:slide={{ duration: homepageHeaderTransition ? 300 : 0 }}
			>
				{@render homepageHeader()}
			</div>
		{/if}
		<div class="main-layout" class:expanded={!wideHeader}>
			<div class="main-background" class:expanded={!wideHeader}></div>
			<div class="main-content page-padding" class:homepage>
				{@render content()}
			</div>
		</div>
	</main>

	<div class="mobile-bottom-bar">
		<div class="bottom-bar-content page-padding">
			{@render bottomNavBar()}
		</div>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	$max-width: 1200px;
	$header-height: 4rem;
	$bottom-bar-height: 3.5rem;

	.layout {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
		padding-top: $header-height;
		min-width: 320px;

		&.homepage {
			overflow: unset;
		}

		@include desktop {
			padding-bottom: 0;
		}

		@include mobile {
			padding-top: 0;
			padding-bottom: $bottom-bar-height;
		}
	}

	.homepage-header {
		position: relative;
		z-index: var(--z-sticky);

		margin: 0 var(--spacing-md);
	}

	.page-padding {
		padding: 0 var(--spacing-2xl);

		@include tablet {
			padding: 0 var(--spacing-md);
		}
	}

	.header {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		top: 0;
		height: $header-height;
		z-index: var(--z-sticky);
		width: 100vw;
		max-width: $max-width;
		display: flex;
		align-items: center;
		transition: max-width 0.25s ease-out;

		&.wide-header {
			width: 100vw;
			max-width: 100vw;
		}

		@include mobile {
			display: none;
		}
	}

	.header-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--color-primary);
		width: 100vw;
		margin-left: calc(-50vw + 50%);
		transition: border 1s ease-out;

		&.border {
			border-bottom: var(--border-width-thin) solid var(--color-neutral);
		}

		&.transparent {
			background: transparent;
		}
	}

	.mobile-bottom-bar {
		display: none;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: $bottom-bar-height;
		background: var(--color-primary);
		z-index: var(--z-sticky);
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

		@include mobile {
			display: block;
		}
	}

	.bottom-bar-content {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.sidebar-container {
		position: relative;
		z-index: var(--z-sticky);
	}

	.main {
		position: relative;
		flex-grow: 1;
		overflow-y: auto;
		scrollbar-width: thin;
		transition: margin-left 0.25s ease-out;

		&.home-page {
			overflow-y: unset;
			scrollbar-width: unset;
			scrollbar-gutter: unset;
		}

		@include mobile {
			padding: 0;
			margin-left: 0 !important;
		}
	}

	.main-layout {
		position: relative;
		margin: 0 var(--spacing-2xl);
		margin-top: var(--spacing-lg);
		border-radius: var(--border-radius-3xl);
		min-height: calc(100dvh - $header-height);
		will-change: margin, border-radius;
		transition:
			margin 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		@include tablet {
			margin-left: var(--spacing-xl);
			margin-right: var(--spacing-xl);
		}

		@include mobile {
			margin-left: 0;
			margin-right: 0;
			margin-top: var(--spacing-sm);
		}
	}

	.main-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--color-background);
		border-radius: var(--border-radius-3xl);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		&.expanded {
			left: calc(-1 * var(--spacing-2xl));
			right: calc(-1 * var(--spacing-2xl));
			border-radius: 0;

			@include tablet {
				left: calc(-1 * var(--spacing-xl));
				right: calc(-1 * var(--spacing-xl));
			}
		}
	}

	.main-content {
		max-width: $max-width;
		margin: 0 auto;
		padding-top: var(--spacing-lg);

		@include mobile {
			padding-top: var(--spacing-md);
		}
	}

	@include mobile {
		.toggle-container {
			margin-left: 0 !important;
		}
	}
</style>
