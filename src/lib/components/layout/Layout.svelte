<script lang="ts">
	import type { Snippet } from 'svelte'

	let { header, content } = $props<{
		header: Snippet
		content: Snippet
	}>()
</script>

<div class="layout">
	<header class="header">
		<div class="header-background"></div>
		<div class="container">
			{@render header()}
		</div>
	</header>
	<main class="main">
		<div class="container">
			{@render content()}
		</div>
	</main>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.layout {
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-gutter: stable;

		@include mobile {
			background: var(--color-neutral-dark);
		}
	}

	.header {
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
		width: 100%;
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
	}

	.container {
		position: relative;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-md);
		width: 100%;
		box-sizing: border-box;

		@include mobile {
			padding: 0;
		}
	}

	.main {
		.container {
			padding-top: var(--spacing-xl);
			padding-bottom: var(--spacing-xl);

			@include mobile {
				padding: 0;
				height: 100%;
				display: flex;
			}
		}

		@include mobile {
			overflow: hidden;
		}
	}
</style>
