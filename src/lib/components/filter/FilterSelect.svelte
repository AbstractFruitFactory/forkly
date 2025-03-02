<script lang="ts">
	let {
		value,
		label = value,
		selected = $bindable(false),
		onChange = () => {},
		id = `filter-${value}`
	}: {
		value: string
		label?: string
		selected?: boolean
		onChange?: (value: string, checked: boolean) => void
		id?: string
	} = $props()

	const handleChange = (event: Event) => {
		const target = event.target as HTMLInputElement
		onChange(value, target.checked)
	}
</script>

<div class="filter-select">
	<input
		type="checkbox"
		{id}
		bind:checked={selected}
		onchange={handleChange}
		class="visually-hidden"
	/>
	<label for={id} class="filter-chip" class:selected>
		{label}
	</label>
</div>

<style lang="scss">
	.filter-select {
		display: inline-block;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	.filter-chip {
		display: inline-block;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--border-radius-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-xs);
		color: var(--color-text);
		cursor: pointer;
		transition: all 0.2s ease;
		user-select: none;

		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}

		&.selected {
			background: var(--color-primary);
			border-color: var(--color-primary);
			color: white;
		}
	}
</style>
