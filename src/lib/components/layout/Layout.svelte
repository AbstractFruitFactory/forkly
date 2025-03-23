<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		header,
		content,
		sidebar,
		sidebarOpen = $bindable(false)
	} = $props<{
		header: Snippet
		content: Snippet
		sidebar?: Snippet
		sidebarOpen?: boolean
	}>()
</script>

<div class="layout">
	<header class="header">
		<div class="header-background"></div>
		{@render header()}
	</header>
	<div class="main-layout">
		{#if sidebar}
			<div class="sidebar-container">
				{#if sidebarOpen}
					{@render sidebar()}
				{/if}
			</div>
		{/if}
		<main class="main" class:with-sidebar={sidebarOpen}>
			<div class="main-content">
				{@render content()}
			</div>
		</main>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.layout {
		height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	.header {
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
		width: 100%;
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 var(--spacing-xl);

		@include mobile {
			padding: 0 var(--spacing-md);
		}
	}

	.header-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--color-neutral-dark);
		border-bottom: 1px solid var(--color-neutral);
		box-shadow: var(--shadow-sm);
		width: 100vw;
		margin-left: calc(-50vw + 50%);
	}

	.main-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
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
		scrollbar-gutter: stable both-edges;
		transition: margin-left 0.25s ease-out;

		&.with-sidebar {
			margin-left: 300px;
		}

		@include mobile {
			padding: 0;
			margin-left: 0 !important;
		}
	}

	.main-content {
		flex-grow: 1;
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--spacing-xl);

		@include mobile {
			padding: 0;
		}
	}

	@include mobile {
		.toggle-container {
			margin-left: 0 !important;
		}
	}
</style>
