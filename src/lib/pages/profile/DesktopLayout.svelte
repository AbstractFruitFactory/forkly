<script lang="ts">
	import type { Snippet } from 'svelte'
	import { fly } from 'svelte/transition'
	import TabSelect from '$lib/components/tab-select/TabSelect.svelte'

	let {
		avatar,
		name,
		email,
		signOut,
		profileInfo,
		createdRecipes,
		savedRecipes,
		tabOptions,
		selectedTab,
		onTabSelect
	}: {
		avatar: Snippet
		name: Snippet
		email: Snippet
		signOut: Snippet
		profileInfo: Snippet
		createdRecipes: Snippet
		savedRecipes: Snippet
		tabOptions: string[]
		selectedTab: string
		onTabSelect: (option: string) => void
	} = $props()
</script>

<div
	class="profile-container"
	in:fly={{ x: -50, duration: 300, delay: 500 }}
	out:fly={{ x: -50, duration: 300 }}
>
	<div class="profile-header-row card">
		<div class="profile-avatar-block">
			{@render avatar()}
		</div>
		<div class="profile-main-block">
			{@render name()}
			{@render email()}
		</div>
		<div class="sign-out">
			{@render signOut()}
		</div>
	</div>

	<div class="profile-content">
		<TabSelect options={tabOptions} onSelect={onTabSelect} />

		<div class="tab-content card">
			{#if selectedTab === 'Profile info'}
				{@render profileInfo()}
			{:else if selectedTab === 'Created recipes'}
				{@render createdRecipes()}
			{:else if selectedTab === 'Saved recipes'}
				{@render savedRecipes()}
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.profile-container {
		max-width: 900px;
		margin: 2rem auto;
	}

	.profile-header-row {
		display: flex;
		align-items: center;
		gap: 2.5rem;
		margin-bottom: 2.5rem;
	}

	.profile-avatar-block {
		flex-shrink: 0;
	}

	.profile-main-block {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.sign-out {
		align-self: flex-end;
	}

	.profile-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}
</style>
