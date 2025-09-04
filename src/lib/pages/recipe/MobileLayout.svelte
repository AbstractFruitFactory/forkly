<script lang="ts">
	import type { Snippet } from 'svelte'
	import Info from 'lucide-svelte/icons/info'
	import ListChecks from 'lucide-svelte/icons/list-checks'
	import ListOrdered from 'lucide-svelte/icons/list-ordered'
	import MessageSquare from 'lucide-svelte/icons/message-square'

	let {
		image,
		tags,
		title,
		actionButtons,
		description,
		nutrition,
		ingredients,
		comments,
		instructions,
	}: {
		image: Snippet
		tags: Snippet
		title: Snippet
		actionButtons: Snippet
		description: Snippet
		nutrition: Snippet
		ingredients: Snippet
		comments: Snippet
		instructions: Snippet<[useCookingMode: boolean]>
	} = $props()

	let activeTab = $state<'overview' | 'ingredients' | 'instructions' | 'comments'>('overview')

	$effect(() => {
		activeTab
		if (typeof document !== 'undefined') {
			const drawerContainer = document.querySelector('.drawer-content') as HTMLElement | null
			const mainContainer = document.querySelector('.main') as HTMLElement | null
			if (drawerContainer) {
				drawerContainer.scrollTo({ top: 0, behavior: 'auto' })
			}
			if (mainContainer) {
				mainContainer.scrollTo({ top: 0, behavior: 'auto' })
			}
		}
	})
</script>

<div class="recipe" data-page="recipe">
	<div class="content">
		{#if activeTab === 'overview'}
			<div class="recipe-image">
				{@render image()}
			</div>

			<div class="header">
				<div class="tags">
					{@render tags()}
				</div>

				<div class="title">
					{@render title()}
				</div>

				<div class="action-buttons">
					{@render actionButtons()}
				</div>
			</div>
			{@render description()}
			{@render nutrition()}
		{:else if activeTab === 'ingredients'}
			{@render ingredients()}
		{:else if activeTab === 'instructions'}
			<div class="cooking-mode">
				{@render instructions(true)}
			</div>
		{:else}
			<div style:margin-bottom="var(--spacing-2xl)">
				{@render comments()}
			</div>
		{/if}
	</div>

	<div class="tabs" data-testid="recipe-tabs">
		<button
			class="tab-button {activeTab === 'overview' ? 'active' : ''}"
			type="button"
			aria-label="Overview"
			aria-pressed={activeTab === 'overview'}
			onclick={() => (activeTab = 'overview')}
		>
			<Info size={20} />
		</button>
		<button
			class="tab-button {activeTab === 'ingredients' ? 'active' : ''}"
			type="button"
			aria-label="Ingredients"
			aria-pressed={activeTab === 'ingredients'}
			onclick={() => (activeTab = 'ingredients')}
		>
			<ListChecks size={20} />
		</button>
		<button
			class="tab-button {activeTab === 'instructions' ? 'active' : ''}"
			type="button"
			aria-label="Instructions"
			aria-pressed={activeTab === 'instructions'}
			onclick={() => (activeTab = 'instructions')}
		>
			<ListOrdered size={20} />
		</button>
		<button
			class="tab-button {activeTab === 'comments' ? 'active' : ''}"
			type="button"
			aria-label="Comments"
			aria-pressed={activeTab === 'comments'}
			onclick={() => (activeTab = 'comments')}
		>
			<MessageSquare size={20} />
		</button>
	</div>
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.recipe {
		position: relative;
		padding-bottom: 50px;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		margin: var(--spacing-xl) 0;
	}

	.recipe-image {
		min-height: 200px;
		max-height: 80dvh;
		border-radius: var(--border-radius-lg);
		overflow: hidden;

		:global(img) {
			display: block;
			width: 100%;
			object-fit: cover;
			border-radius: var(--border-radius-lg);
		}
	}
	.title {
		text-align: center;
	}

	.tags {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}

	.action-buttons {
		display: flex;
		justify-content: center;
		gap: var(--spacing-xl);
	}

	.tabs {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		margin: var(--spacing-sm);
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-md);
		z-index: var(--z-sticky);
		display: flex;
		gap: var(--spacing-md);
		background: var(--color-background);
	}

	.tab-button {
		flex: 1;
		padding: var(--spacing-sm) 0;
		background: transparent;
		border: none;
		color: var(--color-text);
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tab-button.active {
		color: var(--color-primary);
	}

	.content {
		display: flex;
		flex-direction: column;
	}
</style>
