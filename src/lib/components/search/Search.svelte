<script lang="ts">
	import Input from '../input/Input.svelte'

	let {
		placeholder = 'Search...',
		isLoading = false,
		inputElement = $bindable(),
		value = $bindable(''),
		onInput = $bindable((newValue: string) => {}),
		actionButton
	}: {
		placeholder?: string
		isLoading?: boolean
		inputElement?: HTMLInputElement
		value?: string
		onInput?: (value: string) => void
		actionButton?: { text: string; onClick: () => void }
	} = $props()

	const handleInput = (e: Event) => {
		value = (e.target as HTMLInputElement).value
		onInput(value)
	}
</script>

<div class="search-wrapper">
	<div class="search-input-container">
		<svg
			class="search-icon"
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
		<Input bind:value {actionButton} {isLoading}>
			<input
				type="search"
				{placeholder}
				{value}
				oninput={handleInput}
				aria-label="Search"
				bind:this={inputElement}
			/>
		</Input>
	</div>
</div>

<style lang="scss">
	.search-wrapper {
		width: 100%;
		position: relative;
	}

	.search-input-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: var(--spacing-md);
		color: var(--color-neutral);
		pointer-events: none;
		z-index: 1;
	}

	.clear-button {
		position: absolute;
		right: calc(var(--spacing-xl) * 2 + var(--spacing-xs));
		background: none;
		border: none;
		padding: var(--spacing-xs);
		cursor: pointer;
		color: var(--color-neutral);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		transition: all 0.2s ease;
		opacity: 0.7;

		&:hover {
			color: var(--color-text);
			opacity: 1;
			background: var(--color-background-hover);
		}

		&:active {
			transform: scale(0.95);
		}
	}

	.loading-spinner {
		position: absolute;
		right: calc(var(--spacing-xl) * 2 + var(--spacing-xs));
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-neutral);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		pointer-events: none;
		z-index: 2;
		opacity: 0.7;
	}

	:global(.search-input-container input) {
		padding-left: calc(var(--spacing-xl) + var(--spacing-xs)) !important;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
