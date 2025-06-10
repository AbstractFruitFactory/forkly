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
		homepageHeaderTransition = true
	} = $props<{
		header: Snippet
		content: Snippet
		homepage?: boolean
		wideHeader?: boolean
		homepageHeader?: Snippet
		homepageHeaderTransition?: boolean
	}>()

	let mainElement: HTMLElement

	onMount(() => {
		scrollStore.setScrollContainer(mainElement)
	})
</script>

<div class="layout" class:home-page={homepage}>
	<header class="header page-padding" class:home-page={homepage} class:wide-header={wideHeader}>
		<div class="header-background" class:transparent={homepage && wideHeader}></div>
		{@render header()}
	</header>

	<main class="main" class:home-page={homepage} bind:this={mainElement}>
		{#if homepage}
			<div
				class="homepage-header"
				transition:slide={{ duration: homepageHeaderTransition ? 300 : 0 }}
			>
				{@render homepageHeader()}
			</div>
		{/if}
		<div class="main-layout" class:expanded={!wideHeader}>
			<div class="main-content page-padding" class:home-page={homepage}>
				{@render content()}
			</div>
		</div>
	</main>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	$max-width: 1200px;
	$header-height: 4rem;

	.layout {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
		padding-top: $header-height;
		min-width: 320px;

		&.home-page {
			overflow: unset;
		}

		@include desktop {
			padding-bottom: 0;
		}
	}

	.page-padding {
		padding: 0 var(--spacing-2xl);

		@include mobile {
			padding: 0 var(--spacing-xl);
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

		&.transparent {
			background: transparent;
		}
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
		z-index: var(--z-dropdown);
		background: var(--color-background);
		margin: 0 var(--spacing-2xl);
		margin-top: var(--spacing-3xl);
		border-radius: 3rem;
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
			margin-left: var(--spacing-xs);
			margin-right: var(--spacing-xs);
		}

		&.expanded {
			margin: 0;
			max-width: 100vw;
			border-radius: 0;
		}
	}

	.main-content {
		max-width: $max-width;
		margin: 0 auto;
		padding-top: var(--spacing-xl);

		@include mobile {
			padding-top: var(--spacing-lg);
		}
	}

	@include mobile {
		.toggle-container {
			margin-left: 0 !important;
		}
	}
</style>
