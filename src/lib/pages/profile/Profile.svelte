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
	import { goto, invalidateAll } from '$app/navigation'
	import { safeFetch } from '$lib/utils/fetch'
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'

	let {
		user,
		createdRecipes = Promise.resolve([]),
		collections = Promise.resolve([]),
		initialTab,
		onLogout
	}: {
		user: Promise<Omit<User, 'passwordHash'>>
		createdRecipes?: Promise<DetailedRecipe[]>
		collections?: Promise<{ name: string; count: number }[]>
		initialTab?: string
		onLogout?: () => void
	} = $props()

	const tabOptions = ['Profile info', 'Created recipes', 'Saved recipes']
	let selectedTab = $state(initialTab)

	function handleTabSelect(option: (typeof tabOptions)[number]) {
		selectedTab = option
		goto(`/profile?tab=${option}`, { replaceState: true })
	}

	let avatarInput: HTMLInputElement

	async function handleAvatarChange(event: Event) {
		const input = event.target as HTMLInputElement
		const file = input.files?.[0]
		if (!file) return

		const formData = new FormData()
		formData.append('avatar', file)

		const res = await safeFetch<{ avatarUrl: string }>()('/api/avatar', {
			method: 'POST',
			body: formData
		})

		if (res.isOk()) {
			invalidateAll()
		} else {
			console.error('Avatar upload failed')
		}
	}
</script>

{#snippet avatar()}
	<div class="avatar-container">
		{#await user}
			<Skeleton width="120px" height="120px" round />
		{:then user}
			<div
				class="avatar {user.avatarUrl ? 'avatar-image' : 'avatar-placeholder'}"
				style={user.avatarUrl ? `background: url(${user.avatarUrl}) center/cover` : ''}
			>
				{#if !user.avatarUrl}
					<span class="avatar-initial">{user.username[0].toUpperCase()}</span>
				{/if}
			</div>
			<input
				type="file"
				accept="image/*"
				class="hidden-input"
				bind:this={avatarInput}
				onchange={handleAvatarChange}
			/>
			<div class="avatar-edit-icon" onclick={() => avatarInput.click()}>
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
		{/await}
	</div>
{/snippet}

{#snippet name()}
	<div class="profile-title-block">
		<div class="profile-title-row">
			<h1>
				{#await user}
					<Skeleton width="100px" height="24px" />
				{:then user}
					{user.username}
				{/await}
			</h1>
		</div>
	</div>
{/snippet}

{#snippet email()}
	<div class="profile-email">
		{#await user}
			<Skeleton width="100px" height="24px" />
		{:then user}
			{user.email}
		{/await}
	</div>
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
			<div class="profile-info-value">
				{#await user}
					<Skeleton width="100px" height="24px" />
				{:then user}
					{user.username}
				{/await}
			</div>
		</div>
		<div class="profile-info-row">
			<div class="profile-info-label">Email</div>
			<div class="profile-info-value">
				{#await user}
					<Skeleton width="100px" height="24px" />
				{:then user}
					{user.email}
				{/await}
			</div>
		</div>
		<div class="profile-info-row">
			<div class="profile-info-label">Bio</div>
			<div class="profile-info-value">
				{#await user}
					<Skeleton width="100px" height="24px" />
				{:then user}
					{user.bio}
				{/await}
			</div>
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
	{#await collections then collections}
		<CardGrid
			items={collections}
			useAnimation={false}
			emptyMessage="You haven't saved any collections yet."
		>
			{#snippet item(item)}
				<CollectionCard name={item.name} count={item.count} />
			{/snippet}
		</CardGrid>
	{/await}
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
		initialView={initialTab}
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
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
		border: 3px solid var(--color-background);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.avatar-image {
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
	}
	.avatar-placeholder {
		background: #7c7b80;
	}
	.avatar-initial {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-size: 3rem;
		font-weight: 700;
		color: #f8f5e6;
		user-select: none;
	}

	.avatar-edit-icon {
		position: absolute;
		bottom: 8px;
		right: 8px;
		background: var(--color-surface);
		border-radius: 50%;
		padding: 0.3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--color-background);
		cursor: pointer;
	}

	.hidden-input {
		display: none;
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
		font-family: unset;
	}

	.profile-email {
		color: var(--color-text-on-surface);
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
		color: var(--color-text-on-surface);
		font-weight: 600;
		font-size: var(--font-size-md);
	}

	.profile-info-value {
		flex: 1;
		color: var(--color-text-on-surface);
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
