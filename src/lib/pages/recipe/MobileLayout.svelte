<script lang="ts">
	import type { Snippet } from 'svelte'
	import ChartPie from 'lucide-svelte/icons/chart-pie'
	import ListOrdered from 'lucide-svelte/icons/list-ordered'
	import Carrot from 'lucide-svelte/icons/carrot'
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
		hasNutrition = true
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
		hasNutrition?: boolean | Promise<boolean>
	} = $props()

	let activeTab = $state<'nutrition' | 'ingredients' | 'instructions' | 'comments'>('ingredients')
</script>

<div class="recipe" data-page="recipe">
	<div class="content">
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
	</div>

	<div class="tabs" data-testid="recipe-tabs">
		<button
			class="tab-button {activeTab === 'ingredients' ? 'active' : ''}"
			type="button"
			aria-label="Ingredients"
			aria-pressed={activeTab === 'ingredients'}
			onclick={() => (activeTab = 'ingredients')}
		>
			<Carrot size={18} />
		</button>
		<button
			class="tab-button {activeTab === 'instructions' ? 'active' : ''}"
			type="button"
			aria-label="Instructions"
			aria-pressed={activeTab === 'instructions'}
			onclick={() => (activeTab = 'instructions')}
		>
			<ListOrdered size={18} />
		</button>
		{#await Promise.resolve(hasNutrition) then hasNut}
			{#if hasNut}
				<button
					class="tab-button {activeTab === 'nutrition' ? 'active' : ''}"
					type="button"
					aria-label="Nutrition"
					aria-pressed={activeTab === 'nutrition'}
					onclick={() => (activeTab = 'nutrition')}
				>
					<ChartPie size={18} />
				</button>
			{/if}
		{/await}
		<button
			class="tab-button {activeTab === 'comments' ? 'active' : ''}"
			type="button"
			aria-label="Comments"
			aria-pressed={activeTab === 'comments'}
			onclick={() => (activeTab = 'comments')}
		>
			<MessageSquare size={18} />
		</button>
	</div>

	<div class="tab-content card">
		{#if activeTab === 'nutrition'}
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
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.recipe {
		position: relative;
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
		margin: var(--spacing-lg) 0;
		padding: var(--spacing-2xs);
		border-radius: var(--border-radius-full);
		display: flex;
		gap: var(--spacing-2xs);
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-neutral);
		width: 100%;
	}

	.tab-button {
		flex: 1;
		padding: var(--spacing-sm) var(--spacing-md);
		background: transparent;
		border: none;
		color: var(--color-text);
		font-weight: 600;
		font-size: var(--font-size-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-full);
		transition: background-color var(--transition-fast) var(--ease-in-out),
			color var(--transition-fast) var(--ease-in-out);
		gap: var(--spacing-2xs);
	}

	.tab-button.active {
		background-color: var(--color-secondary);
		color: var(--color-text-on-secondary);
	}

	.content {
		display: flex;
		flex-direction: column;
	}

	.tab-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}
</style>
