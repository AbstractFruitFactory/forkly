<script lang="ts">
	import type { Snippet } from 'svelte'
	import TabSelect from '$lib/components/tab-select/TabSelect.svelte'

	let {
		avatar,
		name,
		email,
		signOut,
		membership,
		profileInfo,
		createdRecipes,
		savedRecipes,
		drafts,
		tabOptions,
		selectedTab = tabOptions[0],
		onTabSelect
	}: {
		avatar: Snippet
		name: Snippet
		email: Snippet
		signOut: Snippet
		membership: Snippet
		profileInfo: Snippet
		createdRecipes: Snippet
		savedRecipes: Snippet
		drafts: Snippet
		tabOptions: string[]
		selectedTab?: string
		onTabSelect: (option: string) => void
	} = $props()
</script>

<div class="profile-container">
	<!--
		<div class="membership-button-container">
			<div>
				{@render membership()}
			</div>
		</div>
	-->

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
		<TabSelect options={tabOptions} onSelect={onTabSelect} selected={selectedTab} />

		<div class="tab-content">
			{#if selectedTab === 'Profile info'}
				<div class="card">
					{@render profileInfo()}
				</div>
			{:else if selectedTab === 'Created recipes'}
				{@render createdRecipes()}
			{:else if selectedTab === 'Saved recipes'}
				{@render savedRecipes()}
			{:else if selectedTab === 'Drafts'}
				{@render drafts()}
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.profile-container {
		position: relative;
		max-width: 900px;
		margin: 2rem auto;
	}

	.membership-button-container {
		margin-bottom: var(--spacing-md);
		display: flex;
		justify-content: flex-end;
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
