<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import Input from '../input/Input.svelte'
	import SearchIcon from './SearchIcon.svelte'

	let {
		placeholder = 'Search...',
		isLoading = false,
		inputElement = $bindable(),
		wrapperElement = $bindable(),
		value = $bindable(''),
		onInput = $bindable((newValue: string) => {}),
		onConfirm = $bindable((value: string) => {}),
		onBlur = $bindable(() => {}),
		actionButton,
		formName,
		disabled = false,
		showSearchIcon = true,
		...inputProps
	}: {
		placeholder?: string
		isLoading?: boolean
		inputElement?: HTMLInputElement
		wrapperElement?: HTMLDivElement
		value?: string
		onInput?: (value: string) => void
		onConfirm?: (value: string) => void
		onBlur?: () => void
		actionButton?: { text: string; onClick: () => void }
		formName?: string
		disabled?: boolean
		showSearchIcon?: boolean
	} & Omit<ComponentProps<typeof Input>, 'children' | 'value'> = $props()

	const showClear = $derived(value !== '')

	const handleInput = (e: Event) => {
		value = (e.target as HTMLInputElement).value
		onInput(value)
	}

	const confirmSearch = () => {
		onConfirm(value)
		inputElement?.blur()
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			confirmSearch()
		}
	}

	const clearSearch = () => {
		value = ''
		onInput('')
		inputElement?.focus()
	}

	export const focus = () => {
		inputElement?.focus()
	}
</script>

<div class="search-wrapper" data-flip-id="search-button" bind:this={wrapperElement}>
	<div class="search-input-container">
		<Input bind:value {actionButton} {isLoading} {...inputProps}>
			<input
				type="search"
				{placeholder}
				{value}
				oninput={handleInput}
				onkeydown={handleKeydown}
				onblur={onBlur}
				aria-label="Search"
				name={formName}
				bind:this={inputElement}
				enterkeyhint="search"
				{disabled}
			/>

			{#snippet clearButton()}
				{#if !isLoading && showSearchIcon}
					<div
						class="search-icon-button"
						class:clearable={showClear}
						onclick={showClear ? clearSearch : undefined}
						role="button"
						tabindex={showClear ? 0 : -1}
						onkeydown={(e) => {
							if (!showClear) return
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault()
								clearSearch()
							}
						}}
						aria-label={showClear ? 'Clear search' : 'Search'}
					>
						<SearchIcon isClear={showClear} size={16} color="var(--color-text-on-surface)" />
					</div>
				{/if}
			{/snippet}
		</Input>
	</div>
</div>

<style lang="scss">
	.search-wrapper {
		position: relative;

		max-width: 500px;
		width: 100%;
	}

	.search-input-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon-button {
		cursor: pointer;
		color: var(--color-neutral);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		transition: all 0.2s ease;
		opacity: 0.7;
		pointer-events: none;

		&.clearable {
			pointer-events: auto;
			opacity: 0.7;

			&:hover {
				color: var(--color-text-on-surface);
				opacity: 1;
				background: var(--color-background-hover);
			}

			&:active {
				transform: scale(0.95);
			}
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
