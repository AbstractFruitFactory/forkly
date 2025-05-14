<script lang="ts">
	let {
		checked = $bindable(false),
		disabled = false,
		onchange,
		label
	}: {
		checked?: boolean
		disabled?: boolean
		onchange?: (checked: boolean) => void
		label?: string
	} = $props()

	const handleToggle = (event: Event) => {
		if (disabled) return
		checked = !checked
		onchange?.(checked)
	}
</script>

<label class="switch" aria-checked={checked} aria-disabled={disabled}>
	<input
		type="checkbox"
		{checked}
		{disabled}
		onchange={handleToggle}
		class="switch-input"
		aria-hidden="true"
		tabindex="-1"
	/>
	{#if label}
		<span class="switch-label">{label}</span>
	{/if}
	<span class="switch-track">
		<span class="switch-thumb"></span>
	</span>
</label>

<style lang="scss">
	.switch {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		cursor: pointer;
		user-select: none;
		position: relative;

		&[aria-disabled='true'] {
			cursor: not-allowed;
			opacity: 0.6;
		}
	}

	.switch-input {
		opacity: 0;
		width: 0;
		height: 0;
		position: absolute;
	}

	.switch-track {
		width: 40px;
		height: 22px;
		background: var(--color-neutral, #ccc);
		border-radius: 11px;
		position: relative;
		transition: background 0.2s;
		display: flex;
		align-items: center;
	}

	.switch[aria-checked='true'] .switch-track {
		background: var(--color-primary, #4f46e5);
	}

	.switch-thumb {
		position: absolute;
		left: 2px;
		top: 2px;
		width: 18px;
		height: 18px;
		background: #fff;
		border-radius: 50%;
		transition: transform 0.2s;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
	}

	.switch[aria-checked='true'] .switch-thumb {
		transform: translateX(18px);
	}

	.switch-label {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light, #222);
	}
</style>
