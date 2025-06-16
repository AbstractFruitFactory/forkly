<script lang="ts">
	import type { User } from '$lib/server/db/schema'
	import Button from '$lib/components/button/Button.svelte'
	import RecipeGrid from '$lib/components/recipe-grid/RecipeGrid.svelte'
	import type { DetailedRecipe } from '$lib/server/db/recipe'
	import LogOut from 'lucide-svelte/icons/log-out'
	import CardGrid from '$lib/components/card-grid/CardGrid.svelte'
	import CollectionCard from '$lib/components/collection-card/CollectionCard.svelte'
	import DesktopLayout from './DesktopLayout.svelte'
	import MobileLayout from './MobileLayout.svelte'

	let {
		user,
		createdRecipes = [],
		collections = [],
		onLogout
	}: {
		user: Omit<User, 'passwordHash'>
		createdRecipes?: DetailedRecipe[]
		collections?: { name: string; count: number }[]
		onLogout?: () => void
	} = $props()

	const tabOptions = ['Profile info', 'Created recipes', 'Saved recipes']
	let selectedTab = $state('Profile info')

	function handleTabSelect(option: string) {
		selectedTab = option
	}
</script>

{#snippet avatar()}
	<div class="avatar-container">
		<div
			class="avatar"
			style="background: {user.avatarUrl
				? `url(${user.avatarUrl}) center/cover`
				: `var(--color-${user.username.charCodeAt(0) % 5})`}"
		>
			{#if !user.avatarUrl}
				{user.username[0].toUpperCase()}
			{/if}
		</div>
		<div class="avatar-edit-icon">
			<svg
				width="24"
				height="24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				viewBox="0 0 24 24"
				><path
					d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 1 1 2.828 2.828L11.828 15.828a4 4 0 0 1-1.414.94l-4.243 1.415 1.415-4.243a4 4 0 0 1 .94-1.414z"
				/></svg
			>
		</div>
	</div>
{/snippet}

{#snippet name()}
	<div class="profile-title-block">
		<div class="profile-title-row">
			<h1>{user.username}</h1>
		</div>
	</div>
{/snippet}

{#snippet email()}
	<div class="profile-email">{user.email}</div>
{/snippet}

{#snippet signOut(fullWidth = false)}
	<Button variant="border" size="sm" onclick={onLogout} {fullWidth}>
		<LogOut size={16} />
		Sign out
	</Button>
{/snippet}

{#snippet profileInfo()}
	<div class="profile-info">
		<div class="profile-info-row">
			<div class="profile-info-label">Username</div>
			<div class="profile-info-value">{user.username}</div>
		</div>
		<div class="profile-info-row">
			<div class="profile-info-label">Email</div>
			<div class="profile-info-value">{user.email}</div>
		</div>
		<div class="profile-info-row">
			<div class="profile-info-label">Bio</div>
			<div class="profile-info-value">{user.bio}</div>
		</div>
	</div>
{/snippet}

{#snippet _createdRecipes()}
	<RecipeGrid
		recipes={createdRecipes}
		emptyMessage="You haven't created any recipes yet."
		useAnimation={false}
	/>
{/snippet}

{#snippet _savedRecipes()}
	<CardGrid items={collections} useAnimation={false}>
		{#snippet item(item)}
			<CollectionCard name={item.name} count={item.count} />
		{/snippet}
	</CardGrid>
{/snippet}

<div class="profile-desktop-view">
	<DesktopLayout
		{avatar}
		{name}
		{email}
		{signOut}
		{profileInfo}
		createdRecipes={_createdRecipes}
		savedRecipes={_savedRecipes}
		{tabOptions}
		{selectedTab}
		onTabSelect={handleTabSelect}
	/>
</div>

<div class="profile-mobile-view">
	<MobileLayout
		{avatar}
		{name}
		{email}
		{signOut}
		{profileInfo}
		createdRecipes={_createdRecipes}
		savedRecipes={_savedRecipes}
	/>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.profile-desktop-view {
		display: none;

		@include desktop {
			display: block;
		}
	}

	.profile-mobile-view {
		display: none;

		@include tablet {
			display: block;
		}
	}

	.avatar-container {
		position: relative;
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: var(--color-neutral);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		font-weight: 600;
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
		border: 3px solid var(--color-background);
	}

	.avatar-edit-icon {
		position: absolute;
		bottom: 8px;
		right: 8px;
		background: var(--color-neutral-dark);
		border-radius: 50%;
		padding: 0.3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--color-background);
		cursor: pointer;
	}

	.profile-title-block {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.profile-title-row {
		display: flex;
		align-items: center;
	}

	.profile-title-row h1 {
		margin: 0;
		font-size: var(--font-size-2xl);
		color: white;
	}

	.profile-email {
		color: var(--color-neutral-light);
		font-size: var(--font-size-md);
	}

	.profile-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.profile-info-row {
		display: flex;
		align-items: center;
		padding: 1rem 0;
		border-bottom: 1px solid var(--color-neutral);
	}

	.profile-info-row:last-child {
		border-bottom: none;
	}

	.profile-info-label {
		flex: 0 0 180px;
		color: var(--color-neutral-light);
		font-weight: 600;
		font-size: var(--font-size-md);
	}

	.profile-info-value {
		flex: 1;
		color: white;
		font-size: var(--font-size-md);
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.profile-info-value-edit Button {
		margin-left: 1rem;
	}

	@include tablet {
		.profile-info-row {
			flex-direction: column;
			align-items: flex-start;
			padding: 0.75rem 0;
		}
		.profile-info-label {
			flex: unset;
			width: 100%;
			margin-bottom: 0.25rem;
		}
		.profile-info-value {
			width: 100%;
			gap: 0.5rem;
		}
	}
</style>
