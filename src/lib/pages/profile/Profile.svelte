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
	import type { RecipeDraft } from '$lib/server/db/schema'
	import { deleteDraft } from '$lib/remote-functions/draft.remote'

	let {
		username,
		userData,
		collections,
		initialTab,
		onLogout,
		errors,
		onCreateCollection
	}: {
		username: string
		userData: Promise<{
			isOwner: boolean
			profileUser: User
			recipes: DetailedRecipe[]
			drafts: RecipeDraft[]
		}>
		collections: Promise<{ name: string; count: number }[]>
		initialTab?: string
		onLogout?: () => void
		errors?: { path: string; message: string }[]
		onCreateCollection?: (name: string) => void
	} = $props()

	let tabOptions = $state(['Profile info', 'Created recipes'])
	let signingOut = $state(false)

	$effect(() => {
		userData.then((data) => {
			if (data.isOwner) {
				tabOptions = ['Profile info', 'Created recipes', 'Saved recipes', 'Drafts']
			}
		})
	})

	let selectedTab = $state(initialTab)

	function handleTabSelect(option: Awaited<typeof tabOptions>[number]) {
		selectedTab = option
	}

	let avatarInput = $state<HTMLInputElement>()
	let deletePopupOpen = $state(false)
	let recipeToDelete: DetailedRecipe | undefined = $state()
	let editPopupOpen = $state(false)
	let recipeToEdit: DetailedRecipe | undefined = $state()
	let draftToEdit: RecipeDraft | undefined = $state()
	let editDraftPopupOpen = $state(false)
	let draftToDelete: RecipeDraft | undefined = $state()
	let deleteDraftPopupOpen = $state(false)
	let editDrawer = $state<Drawer>()
	let editPopup = $state<Popup>()

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

	function openEditDraftPopup(draft: RecipeDraft) {
		draftToEdit = draft
		editDraftPopupOpen = true
	}

	function openDeleteDraftPopup(draft: RecipeDraft) {
		draftToDelete = draft
		deleteDraftPopupOpen = true
	}

	async function handleDeleteDraft() {
		if (!draftToDelete) return
		await deleteDraft({ id: draftToDelete.id })

		deleteDraftPopupOpen = false
		draftToDelete = undefined
		invalidateAll()
	}

	const searchTags = async (query: string): Promise<{ name: string; count: number }[]> => {
		const response = await safeFetch<{ tags: { name: string; count: number }[] }>()(
			`/tags?q=${encodeURIComponent(query)}`
		)
		return response.isOk() ? response.value.tags : []
	}

	const getMenuOptions = (recipe: DetailedRecipe) => {
		return {
			Edit: () => openEditPopup(recipe),
			Delete: () => openDeletePopup(recipe)
		} as { [key: string]: () => void }
	}
</script>

{#snippet avatar()}
	<div class="avatar-container">
		{#await userData}
			<Skeleton width="120px" height="120px" round />
		{:then data}
			<div
				class="avatar {data.profileUser.avatarUrl ? 'avatar-image' : 'avatar-placeholder'}"
				style={data.profileUser.avatarUrl
					? `background: url(${data.profileUser.avatarUrl}) center/cover`
					: ''}
			>
				{#if !data.profileUser.avatarUrl}
					<span class="avatar-initial">{username[0].toUpperCase()}</span>
				{/if}
			</div>
			{#if data.isOwner}
				<input
					type="file"
					accept="image/*"
					class="hidden-input"
					bind:this={avatarInput}
					onchange={handleAvatarChange}
				/>
				<button
					class="avatar-edit-icon"
					onclick={() => avatarInput!.click()}
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
				{username}
			</h1>
		</div>
	</div>
{/snippet}

{#snippet email()}
	{#await userData}
		<Skeleton width="100px" height="24px" />
	{:then data}
		{(data.profileUser as PrivateUser).email}
	{/await}
{/snippet}

{#snippet signOut(fullWidth = false)}
	{#await userData then data}
		{#if data.isOwner && onLogout}
			<Button
				loading={signingOut}
				variant="border"
				color="neutral"
				size="sm"
				onclick={() => {
					signingOut = true
					onLogout()
				}}
				{fullWidth}
			>
				<LogOut size={16} />
				Sign out
			</Button>
		{/if}
	{/await}
{/snippet}

{#snippet membership(fullWidth = false)}
	{#await userData then data}
		{#if data.isOwner}
			<Button --background-color="#5E2BFF" size="sm" href="/membership" {fullWidth}>
				🔒 Membership
			</Button>
		{/if}
	{/await}
{/snippet}

{#snippet profileInfo()}
	<div class="profile-info">
		<div class="profile-info-row">
			<div class="profile-info-label">Username</div>
			<div class="profile-info-value">
				{#await userData}
					<Skeleton width="100px" height="24px" />
				{:then data}
					{username}
				{/await}
			</div>
		</div>
		{#await userData then data}
			{#if data.isOwner}
				<div class="profile-info-row">
					<div class="profile-info-label">Email</div>
					<div class="profile-info-value">
						{#await userData}
							<Skeleton width="100px" height="24px" />
						{:then data}
							{(data.profileUser as PrivateUser).email}
						{/await}
					</div>
				</div>
			{/if}
		{/await}
	</div>
{/snippet}

{#snippet _createdRecipes()}
	{#await userData}
		<div class="empty-message">Loading...</div>
	{:then data}
		<RecipeGrid
			recipes={Promise.resolve(data.recipes)}
			emptyMessage="No recipes created yet!"
			useAnimation={false}
			menuOptions={data.isOwner ? getMenuOptions : undefined}
		/>
	{/await}
{/snippet}

{#snippet _savedRecipes()}
	{#await Promise.all([userData, collections]) then [data, collections]}
		{#if data.isOwner}
			<CardGrid
				items={[
					{ id: '__new__', name: 'new', count: 0 },
					...collections.map((collection) => ({
						...collection,
						id: collection.name
					}))
				]}
				useAnimation={false}
				emptyMessage="You haven't saved any collections yet."
			>
				{#snippet item(item)}
					{#if item.id === '__new__'}
						<CollectionCard createNew {onCreateCollection} />
					{:else}
						<CollectionCard name={item.name} count={item.count} />
					{/if}
				{/snippet}
			</CardGrid>
		{/if}
	{/await}
{/snippet}

{#snippet _drafts()}
	{#await userData}
		<div class="empty-message">Loading...</div>
	{:then data}
		{#if data.drafts.length === 0}
			<div class="empty-message">No drafts yet!</div>
		{:else}
			<div class="drafts-list">
				{#each data.drafts as draft}
					<div class="draft-card card">
						<div class="draft-title">{draft.title || 'Untitled draft'}</div>
						<div class="draft-meta">Created: {new Date(draft.createdAt).toLocaleString()}</div>
						<div class="draft-description">{draft.description}</div>
						<Button
							variant="border"
							color="neutral"
							size="sm"
							onclick={() => openEditDraftPopup(draft)}>Edit</Button
						>
						<Button
							variant="border"
							color="neutral"
							size="sm"
							onclick={() => openDeleteDraftPopup(draft)}>Delete</Button
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

{#snippet editRecipe()}
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
				instructions: recipeToEdit.instructions.map((instruction) => ({
					...instruction,
					ingredients: instruction.ingredients.map((ingredient) => ({
						id: ingredient.id,
						name: ingredient.name,
						quantity: ingredient.quantity?.text ?? '',
						measurement: ingredient.measurement
					}))
				}))
			}}
			editMode={{
				onSave: () => {
					editPopupOpen = false
					invalidateAll()
				}
			}}
			onSearchTags={searchTags}
			isLoggedIn={Promise.resolve(true)}
			{errors}
			onOpenPreview={() => {
				editDrawer?.scrollToTop()
				editPopup?.scrollToTop()
			}}
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
				servings: draftToEdit.servings ?? 1,
				nutritionMode: 'auto',
				instructions: draftToEdit.instructions ?? []
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
			isLoggedIn={Promise.resolve(true)}
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
		bind:this={editPopup}
	>
		{@render editRecipe()}
	</Popup>
</div>

{#if editPopupOpen && mobileStore.isMobile}
	<div
		class="mobile-only"
		style="z-index: var(--z-modal); position: fixed; top: 0; left: 0; right: 0; bottom: 0;"
	>
		<Drawer bind:this={editDrawer} position="side" bind:isOpen={editPopupOpen} title="Edit Recipe">
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
		{membership}
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
		{membership}
		{profileInfo}
		createdRecipes={_createdRecipes}
		savedRecipes={_savedRecipes}
		drafts={_drafts}
		{selectedTab}
		onTabSelect={handleTabSelect}
	/>
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

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
</style>
