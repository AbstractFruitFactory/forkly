<script lang="ts">
	import Dropdown from '../dropdown/Dropdown.svelte'
	import Popup from '../popup/Popup.svelte'
	import Input from '../input/Input.svelte'
	import Button from '../button/Button.svelte'
	import { safeFetch } from '$lib/utils/fetch'
	import MoreVertical from 'lucide-svelte/icons/more-vertical'
	import { invalidateAll } from '$app/navigation'
	import Plus from 'lucide-svelte/icons/plus'
	import { scale } from 'svelte/transition'

	let {
		name,
		count = 0,
		createNew = false,
		onCreateCollection
	}: {
		name?: string
		count?: number
		createNew?: boolean
		onCreateCollection?: (name: string) => void
		onClick?: () => void
		onclick?: () => void
	} = $props()

	let menuOpen = $state(false)
	let renameOpen = $state(false)
	let deleteOpen = $state(false)
	let newName = $state(name)

	let createOpen = $state(false)
	let newCollectionName = $state('')
	let creatingCollection = $state(false)
	let createCollectionError = $state('')

	const handleRename = async () => {
		const result = await safeFetch<{ success: true }>()('/collections/rename', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ oldName: name, newName })
		})

		if (result.isOk()) {
			renameOpen = false
			invalidateAll()
		}
	}

	const handleDelete = async () => {
		const result = await safeFetch<{ success: true }>()('/collections/delete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name })
		})

		if (result.isOk()) {
			invalidateAll()
		}
	}

	async function handleCreateCollection() {
		const trimmed = newCollectionName.trim()
		if (!trimmed) {
			createCollectionError = 'Please enter a collection name'
			return
		}
		creatingCollection = true
		createCollectionError = ''

		await onCreateCollection?.(trimmed)
		createOpen = false
		creatingCollection = false
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
	this={createNew ? 'button' : 'div'}
	class="collection-card card"
	class:create-new={createNew}
	aria-label={createNew ? 'Create new collection' : undefined}
	onclick={createNew ? () => (createOpen = true) : undefined}
	transition:scale
>
	{#if !createNew && name !== 'All Recipes'}
		<div class="menu-container">
			<button class="menu-btn" onclick={() => (menuOpen = !menuOpen)} aria-label="Collection menu">
				<MoreVertical size={16} />
			</button>

			<Dropdown bind:isOpen={menuOpen} nbrOfItems={2}>
				{#snippet dropdownContent(item)}
					{#snippet rename()}
						Rename
					{/snippet}

					{#snippet _delete()}
						Delete
					{/snippet}

					{@render item(
						rename,
						() => {
							menuOpen = false
							renameOpen = true
						},
						0
					)}
					{@render item(
						_delete,
						() => {
							menuOpen = false
							deleteOpen = true
						},
						1
					)}
				{/snippet}
			</Dropdown>
		</div>
	{/if}

	{#if createNew}
		<div class="collection-content">
			<Plus size={20} />
			<div class="collection-name">New Collection</div>
		</div>
	{:else}
		<a href={`/collection/${name}`} class="collection-link">
			<div class="collection-content">
				<h3 class="collection-name">{name}</h3>
				<div class="collection-count">{count} {count === 1 ? 'recipe' : 'recipes'}</div>
			</div>
		</a>
	{/if}
</svelte:element>

<Popup
	isOpen={renameOpen}
	onClose={() => (renameOpen = false)}
	title="Rename Collection"
	width="300px"
>
	<Input bind:value={newName} actionButton={{ text: 'Save', onClick: handleRename }}>
		<input type="text" placeholder="New name" bind:value={newName} />
	</Input>
</Popup>

<Popup
	isOpen={deleteOpen}
	onClose={() => (deleteOpen = false)}
	title="Delete Collection"
	width="300px"
>
	<div class="delete-content">
		<p>Are you sure you want to delete "{name}"?</p>
		<div class="delete-actions">
			<Button color="neutral" variant="border" onclick={() => (deleteOpen = false)}>Cancel</Button>
			<Button color="primary" onclick={handleDelete}>Delete</Button>
		</div>
	</div>
</Popup>

<Popup
	isOpen={createOpen}
	onClose={() => (createOpen = false)}
	title="New Collection"
	width="400px"
>
	<div>
		<Input bind:value={newCollectionName}>
			<input type="text" placeholder="Collection name" bind:value={newCollectionName} />
		</Input>

		{#if createCollectionError}
			<div class="error-text">{createCollectionError}</div>
		{/if}

		<div class="create-actions">
			<Button color="neutral" variant="border" onclick={() => (createOpen = false)}>Cancel</Button>
			<Button color="primary" loading={creatingCollection} onclick={handleCreateCollection}
				>Create</Button
			>
		</div>
	</div>
</Popup>

<style lang="scss">
	.collection-card {
		position: relative;
		height: 150px;
		width: 100%;

		transition:
			transform var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out);

		&:hover {
			box-shadow: var(--shadow-lg);
		}

		&.create-new {
			box-shadow: none;
			border: 2px dashed var(--color-neutral-light);
		}
	}

	.collection-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 0.5rem;
		padding: 1.5rem;
	}

	.collection-name {
		margin: 0;
		font-size: var(--font-size-lg);
		text-align: center;
	}

	.collection-count {
		color: var(--color-neutral-light);
		font-size: var(--font-size-sm);
	}

	.menu-container {
		position: absolute;
		top: var(--spacing-sm);
		right: var(--spacing-sm);
	}

	.menu-btn {
		background: none;
		border: none;
		color: var(--color-neutral-light);
		padding: var(--spacing-xs);
		border-radius: var(--border-radius-sm);
		cursor: pointer;
		transition: background-color var(--transition-fast) var(--ease-in-out);

		&:hover {
			background-color: var(--color-hover);
			color: var(--color-primary);
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

	.error-text {
		color: var(--color-error);
		margin-top: var(--spacing-sm);
	}

	.create-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-md);
	}
</style>
