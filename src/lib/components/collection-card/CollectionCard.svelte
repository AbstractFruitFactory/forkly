<script lang="ts">
	import Dropdown from '../dropdown/Dropdown.svelte'
	import Popup from '../popup/Popup.svelte'
	import Input from '../input/Input.svelte'
	import Button from '../button/Button.svelte'
	import { safeFetch } from '$lib/utils/fetch'
	import MoreVertical from 'lucide-svelte/icons/more-vertical'
	import { invalidateAll } from '$app/navigation'

	let { name, count = 0 }: { name: string; count?: number } = $props()

	let menuOpen = $state(false)
	let renameOpen = $state(false)
	let deleteOpen = $state(false)
	let newName = $state(name)

	const handleRename = async () => {
		const result = await safeFetch<{ success: true }>()('/api/collections/rename', {
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
		const result = await safeFetch<{ success: true }>()('/api/collections/delete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name })
		})

		if (result.isOk()) {
			invalidateAll()
		}
	}
</script>

<div class="collection-card card">
	{#if name !== 'All Recipes'}
		<div class="menu-container">
			<button class="menu-btn" onclick={() => (menuOpen = !menuOpen)} aria-label="Collection menu">
				<MoreVertical size={16} />
			</button>
			
			<Dropdown bind:isOpen={menuOpen}>
				<button
					class="dropdown-item"
					onclick={() => {
						menuOpen = false
						renameOpen = true
					}}
				>
					Rename
				</button>
				<button
					class="dropdown-item delete"
					onclick={() => {
						menuOpen = false
						deleteOpen = true
					}}
				>
					Delete
				</button>
			</Dropdown>
		</div>
	{/if}

	<a href={`/collection/${name}`} class="collection-link">
		<div class="collection-content">
			<h3 class="collection-name">{name}</h3>
			<div class="collection-count">{count} {count === 1 ? 'recipe' : 'recipes'}</div>
		</div>
	</a>
</div>

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
			<Button color="primary" onclick={handleDelete}>Delete</Button>
			<Button variant="border" onclick={() => (deleteOpen = false)}>Cancel</Button>
		</div>
	</div>
</Popup>

<style lang="scss">
	.collection-card {
		position: relative;
		height: 100%;
		width: 100%;

		transition:
			transform var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out);

		&:hover {
			box-shadow: var(--shadow-lg);
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

	.collection-icon {
		background: var(--color-neutral-dark);
		border-radius: 50%;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
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

	.dropdown-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: var(--spacing-sm) var(--spacing-md);
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-white);

		&:hover {
			background-color: var(--color-hover);
		}
	}

	.dropdown-item.delete {
		color: var(--color-error);
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
</style>
