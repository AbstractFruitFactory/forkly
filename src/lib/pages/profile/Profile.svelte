<script lang="ts" module>
	type Draft = {
		id: string
		title: string
		description?: string
		imageUrl?: string
		instructions: DetailedRecipe['instructions']
		tags: string[]
		servings: number
		nutrition?: {
			calories: number
			protein: number
			carbs: number
			fat: number
		},
		createdAt: string
	}
</script>

<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'
	import RecipeGrid from '$lib/components/recipe-grid/RecipeGrid.svelte'
	import type { DetailedRecipe } from '$lib/server/db/recipe'
	import LogOut from 'lucide-svelte/icons/log-out'
	import CardGrid from '$lib/components/card-grid/CardGrid.svelte'
	import CollectionCard from '$lib/components/collection-card/CollectionCard.svelte'
	import DesktopLayout from './DesktopLayout.svelte'
	import MobileLayout from './MobileLayout.svelte'
	import { invalidateAll } from '$app/navigation'
	import { safeFetch } from '$lib/utils/fetch'
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'
	import type { PrivateUser, User } from '$lib/server/db/user'
	import Popup from '$lib/components/popup/Popup.svelte'
	import NewRecipe from '$lib/pages/new-recipe/NewRecipe.svelte'
	import Drawer from '$lib/components/drawer/Drawer.svelte'
	import { mobileStore } from '$lib/state/mobile.svelte'

	let {
		user,
		createdRecipes = Promise.resolve([]),
		collections = Promise.resolve([]),
		initialTab,
		onLogout,
		isOwner,
		drafts = Promise.resolve([]),
		errors
	}: {
		user: Promise<User>
		createdRecipes?: Promise<DetailedRecipe[]>
		collections?: Promise<{ name: string; count: number }[]>
		initialTab?: string
		onLogout?: () => void
		isOwner?: boolean
		drafts?: Promise<Draft[]>
		errors?: { path: string; message: string }[]
	} = $props()

	const tabOptions = isOwner
		? ['Profile info', 'Created recipes', 'Saved recipes', 'Drafts']
		: ['Profile info', 'Created recipes']
	let selectedTab = $state(initialTab)

	function handleTabSelect(option: (typeof tabOptions)[number]) {
		selectedTab = option
	}

	let avatarInput: HTMLInputElement
	let deletePopupOpen = $state(false)
	let recipeToDelete: DetailedRecipe | undefined = $state()
	let editPopupOpen = $state(false)
	let recipeToEdit: DetailedRecipe | undefined = $state()
	let draftToEdit: any = $state()
	let editDraftPopupOpen = $state(false)
	let draftToDelete: any = $state()
	let deleteDraftPopupOpen = $state(false)

	async function handleAvatarChange(event: Event) {
		const input = event.target as HTMLInputElement
		const file = input.files?.[0]
		if (!file) return

		const formData = new FormData()
		formData.append('avatar', file)

		const res = await safeFetch<{ avatarUrl: string }>()('/avatar', {
			method: 'POST',
			body: formData
		})

		if (res.isOk()) {
			invalidateAll()
		} else {
			console.error('Avatar upload failed')
		}
	}

	async function handleDeleteRecipe() {
		if (!recipeToDelete) return

		const result = await safeFetch<{ success: true }>()('/recipes/delete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: recipeToDelete.id })
		})

		if (result.isOk()) {
			deletePopupOpen = false
			recipeToDelete = undefined
			invalidateAll()
		}
	}

	function openDeletePopup(recipe: DetailedRecipe) {
		recipeToDelete = recipe
		deletePopupOpen = true
	}

	function openEditPopup(recipe: DetailedRecipe) {
		recipeToEdit = recipe
		editPopupOpen = true
	}

	function openEditDraftPopup(draft: Draft) {
		draftToEdit = draft
		editDraftPopupOpen = true
	}

	function openDeleteDraftPopup(draft: Draft) {
		draftToDelete = draft
		deleteDraftPopupOpen = true
	}

	async function handleDeleteDraft() {
		if (!draftToDelete) return
		const result = await safeFetch<{ success: true }>()(`/recipes/draft/${draftToDelete.id}`, {
			method: 'DELETE'
		})
		if (result.isOk()) {
			deleteDraftPopupOpen = false
			draftToDelete = undefined
			invalidateAll()
		}
	}

	const searchTags = async (query: string): Promise<{ name: string; count: number }[]> => {
		const response = await safeFetch<{ tags: { name: string; count: number }[] }>()(
			`/tags?q=${encodeURIComponent(query)}`
		)
		return response.isOk() ? response.value.tags : []
	}

	const searchIngredients = async (query: string): Promise<{ id: string; name: string }[]> => {
		if (!query.trim()) return []
		const result = await safeFetch<{ id: string; name: string }[]>()(`/ingredients/lookup/${query}`)
		return result.isOk() ? result.value : []
	}

	function getMenuOptions(recipe: DetailedRecipe) {
		if (!isOwner) return {}

		return {
			Edit: () => openEditPopup(recipe),
			Delete: () => openDeletePopup(recipe)
		} as { [key: string]: () => void }
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
			{#if isOwner}
				<input
					type="file"
					accept="image/*"
					class="hidden-input"
					bind:this={avatarInput}
					onchange={handleAvatarChange}
				/>
				<button
					class="avatar-edit-icon"
					onclick={() => avatarInput.click()}
					aria-label="Edit avatar"
				>
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
				</button>
			{/if}
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
	{#if isOwner}
		<div class="profile-email">
			{#await user}
				<Skeleton width="100px" height="24px" />
			{:then user}
				{(user as PrivateUser).email}
			{/await}
		</div>
	{/if}
{/snippet}

{#snippet signOut(fullWidth = false)}
	{#if isOwner && onLogout}
		<Button variant="border" color="neutral" size="sm" onclick={onLogout} {fullWidth}>
			<LogOut size={16} />
			Sign out
		</Button>
	{/if}
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
		{#if isOwner}
			<div class="profile-info-row">
				<div class="profile-info-label">Email</div>
				<div class="profile-info-value">
					{#await user}
						<Skeleton width="100px" height="24px" />
					{:then user}
						{(user as PrivateUser).email}
					{/await}
				</div>
			</div>
		{/if}
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
		emptyMessage="No recipes created yet!"
		useAnimation={false}
		menuOptions={isOwner ? getMenuOptions : undefined}
	/>
{/snippet}

{#snippet _savedRecipes()}
	{#if isOwner}
		{#await collections then collections}
			<CardGrid
				items={collections.map((collection) => ({
					...collection,
					id: collection.name
				}))}
				useAnimation={false}
				emptyMessage="You haven't saved any collections yet."
			>
				{#snippet item(item)}
					<CollectionCard name={item.name} count={item.count} />
				{/snippet}
			</CardGrid>
		{/await}
	{/if}
{/snippet}

{#snippet _drafts()}
	{#await drafts then draftsList}
		{#if draftsList.length === 0}
			<div class="empty-message">No drafts yet!</div>
		{:else}
			<div class="drafts-list">
				{#each draftsList as draft}
					<div class="draft-card card">
						<div class="draft-title">{draft.title || 'Untitled draft'}</div>
						<div class="draft-meta">Created: {new Date(draft.createdAt).toLocaleString()}</div>
						<div class="draft-description">{draft.description}</div>
						<Button variant="border" size="sm" onclick={() => openEditDraftPopup(draft)}
							>Edit</Button
						>
						<Button variant="border" size="sm" onclick={() => openDeleteDraftPopup(draft)}
							>Delete</Button
						>
					</div>
				{/each}
			</div>
		{/if}
	{/await}
{/snippet}

<Popup
	isOpen={deletePopupOpen}
	onClose={() => (deletePopupOpen = false)}
	title="Delete Recipe"
	width="300px"
>
	<div class="delete-content">
		<p>Are you sure you want to delete "{recipeToDelete?.title}"?</p>
		<div class="delete-actions">
			<Button color="primary" onclick={handleDeleteRecipe}>Delete</Button>
			<Button variant="border" onclick={() => (deletePopupOpen = false)}>Cancel</Button>
		</div>
	</div>
</Popup>

{#snippet editRecipe(draft = false)}
	{#if recipeToEdit}
		<NewRecipe
			prefilledData={{
				id: recipeToEdit.id,
				title: recipeToEdit.title,
				description: recipeToEdit.description ?? '',
				image: recipeToEdit.imageUrl ?? '',
				tags: recipeToEdit.tags,
				servings: recipeToEdit.servings,
				nutritionMode: 'auto',
				instructions: recipeToEdit.instructions
			}}
			editMode={{
				onSave: () => {
					recipeToEdit = undefined
					editPopupOpen = false
					invalidateAll()
				}
			}}
			onSearchTags={searchTags}
			onSearchIngredients={searchIngredients}
			{errors}
		/>
	{/if}
{/snippet}

{#snippet editDraft()}
	{#if draftToEdit}
		<NewRecipe
			prefilledData={{
				id: draftToEdit.id,
				title: draftToEdit.title,
				description: draftToEdit.description ?? '',
				image: draftToEdit.imageUrl ?? '',
				tags: draftToEdit.tags ?? [],
				servings: draftToEdit.servings,
				nutritionMode: 'auto',
				instructions: draftToEdit.instructions
			}}
			draftMode={{
				onSaveDraft: () => {
					draftToEdit = undefined
					editDraftPopupOpen = false
					invalidateAll()
				},
				onPublish: () => {
					draftToEdit = undefined
					editDraftPopupOpen = false
					selectedTab = 'Created recipes'
					invalidateAll()
				}
			}}
			onSearchTags={searchTags}
			onSearchIngredients={searchIngredients}
			{errors}
		/>
	{/if}
{/snippet}

<Popup
	isOpen={deleteDraftPopupOpen}
	onClose={() => (deleteDraftPopupOpen = false)}
	title="Delete Draft"
	width="300px"
>
	<div class="delete-content">
		<p>Are you sure you want to delete "{draftToDelete?.title || 'Untitled draft'}"?</p>
		<div class="delete-actions">
			<Button color="primary" onclick={handleDeleteDraft}>Delete</Button>
			<Button variant="border" onclick={() => (deleteDraftPopupOpen = false)}>Cancel</Button>
		</div>
	</div>
</Popup>

<div class="desktop-only">
	<Popup
		isOpen={editPopupOpen}
		onClose={() => (editPopupOpen = false)}
		title="Edit Recipe"
		width="90vw"
	>
		{@render editRecipe()}
	</Popup>
</div>

{#if editPopupOpen && mobileStore.isMobile}
	<div
		class="mobile-only"
		style="z-index: var(--z-modal); position: fixed; top: 0; left: 0; right: 0; bottom: 0;"
	>
		<Drawer position="side" bind:isOpen={editPopupOpen} title="Edit Recipe">
			{@render editRecipe()}
		</Drawer>
	</div>
{/if}

<div class="desktop-only">
	<Popup
		isOpen={editDraftPopupOpen}
		onClose={() => (editDraftPopupOpen = false)}
		title="Edit Draft"
		width="90vw"
	>
		{@render editDraft()}
	</Popup>
</div>

{#if editDraftPopupOpen && mobileStore.isMobile}
	<div
		class="mobile-only"
		style="z-index: var(--z-modal); position: fixed; top: 0; left: 0; right: 0; bottom: 0;"
	>
		<Drawer position="side" bind:isOpen={editDraftPopupOpen} title="Edit Draft">
			{@render editDraft()}
		</Drawer>
	</div>
{/if}

<div class="profile-desktop-view">
	<DesktopLayout
		{avatar}
		{name}
		{email}
		{signOut}
		{profileInfo}
		createdRecipes={_createdRecipes}
		savedRecipes={_savedRecipes}
		drafts={_drafts}
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
		drafts={_drafts}
		{selectedTab}
		onTabSelect={handleTabSelect}
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

	.delete-content p {
		margin-top: 0;
	}

	.delete-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-md);
	}

	.empty-message {
		text-align: center;
		padding: var(--spacing-md);
		color: var(--color-text-on-surface);
		font-size: var(--font-size-md);
	}

	.drafts-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.draft-card {
		padding: var(--spacing-md);
		border-radius: var(--border-radius-md);
		background: var(--color-surface);
		border: 1px solid var(--color-neutral);
		box-shadow: var(--shadow-sm);
	}

	.draft-title {
		font-size: var(--font-size-lg);
		font-weight: 700;
		margin-bottom: var(--spacing-sm);
		color: var(--color-text-on-surface);
	}

	.draft-meta {
		font-size: var(--font-size-sm);
		color: var(--color-text-on-surface-secondary);
		margin-bottom: var(--spacing-sm);
	}

	.draft-description {
		font-size: var(--font-size-md);
		color: var(--color-text-on-surface);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.edit-draft-btn {
		margin-top: var(--spacing-sm);
		padding: 0.5em 1em;
		background: var(--color-primary);
		color: #fff;
		border: none;
		border-radius: var(--border-radius-sm);
		cursor: pointer;
		font-size: var(--font-size-md);
		transition: background 0.2s;
	}
	.edit-draft-btn:hover {
		background: var(--color-primary-dark);
	}
	.delete-draft-btn {
		margin-top: var(--spacing-sm);
		padding: 0.5em 1em;
		background: var(--color-danger);
		color: #fff;
		border: none;
		border-radius: var(--border-radius-sm);
		cursor: pointer;
		font-size: var(--font-size-md);
		transition: background 0.2s;
	}
	.delete-draft-btn:hover {
		background: var(--color-danger-dark);
	}
</style>
