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
		<div class="header-background" class:border={!homepage}></div>
		{@render header()}
	</header>

	<main class="main" class:homepage bind:this={mainElement}>
		<div class="main-page-header-background"></div>
		{#if homepage}
			<div
				class="homepage-header"
				transition:slide={{ duration: homepageHeaderTransition ? 300 : 0 }}
			>
				{@render homepageHeader()}
			</div>
		{/if}
		<div class="main-layout" class:expanded={!wideHeader} class:homepage>
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

	$content-max-width: 1200px;
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
		padding: 0 var(--spacing-md);
		background: var(--color-secondary);
	}

	.page-padding {
		padding: 0 var(--spacing-4xl);

		@include tablet {
			padding: 0 var(--spacing-md);
		}
	}

	.header {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		margin-left: calc(-1 * var(--spacing-xs));
		top: 0;
		height: $header-height;
		z-index: var(--z-sticky);
		width: 100vw;
		max-width: $content-max-width;
		display: flex;
		align-items: center;
		transition: padding 0.25s ease-out;

		&.wide-header {
			width: 100%;
			padding: 0;

			@media (max-width: $content-max-width) {
				padding: 0 var(--spacing-md);
			}
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
		background: var(--color-secondary);
		width: 100vw;
		margin-left: calc(-50vw + 50%);
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
		scrollbar-color: var(--color-primary) var(--color-background);
		overflow-x: hidden;

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
		border-radius: var(--border-radius-3xl);
		min-height: calc(100dvh - $header-height);
		will-change: margin, border-radius;
		transition:
			margin 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.main-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: var(--border-radius-3xl);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		background: var(--color-background);
		max-width: $content-max-width;
		margin: 0 auto;

		&.expanded {
			left: calc(-1 * var(--spacing-4xl));
			right: calc(-1 * var(--spacing-4xl));
			margin-top: calc(var(--spacing-2xl) * -1);
			border-radius: 0;
			max-width: 100%;

			@include tablet {
				left: calc(-1 * var(--spacing-3xl));
				right: calc(-1 * var(--spacing-3xl));
			}
		}
	}

	.main-content {
		max-width: $content-max-width;
		margin: 0 auto;
		padding-bottom: var(--spacing-2xl);
		padding-top: var(--spacing-xl);
		position: relative;
		min-height: calc(100dvh - $header-height);

		@include mobile {
			padding-top: var(--spacing-md);
			min-height: calc(100dvh - $bottom-bar-height);

			&.homepage {
				padding-top: var(--spacing-md);
			}
		}
	}

	@include mobile {
		.toggle-container {
			margin-left: 0 !important;
		}
	}
</style>
