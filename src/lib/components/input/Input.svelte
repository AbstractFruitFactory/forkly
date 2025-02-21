<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children }: { children: Snippet } = $props()
</script>

<div class="input-wrapper">
	{@render children()}
</div>

<style lang="scss">
	@mixin input-base {
		width: 100%;
		padding: var(--spacing-md) var(--spacing-lg);
		border: var(--border-width-thin) solid var(--color-neutral);
		border-radius: var(--border-radius-md);
		font-family: var(--font-sans);
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
		background-color: var(--color-neutral-dark);
		height: 2.7rem;
		transition: all var(--transition-fast) var(--ease-in-out);

		&::placeholder {
			color: var(--color-neutral-light);
			opacity: 0.5;
		}

		&:hover {
			border-color: var(--color-primary);
		}

		&:focus {
			outline: none;
			border-color: var(--color-primary);
			box-shadow: 0 0 0 var(--border-width-thin) var(--color-primary-light);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
			background-color: var(--color-neutral-darker, var(--color-neutral-dark));
		}
	}

	.input-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;

		:global(input),
		:global(select),
		:global(textarea) {
			@include input-base;
		}

		:global(select) {
			cursor: pointer;
			appearance: none;
			padding-right: var(--spacing-xl);
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
			background-repeat: no-repeat;
			background-position: right var(--spacing-md) center;
			background-size: var(--spacing-md);

			&:focus {
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
			}
		}

		:global(textarea) {
			resize: none;
			height: 10rem;
			padding: var(--spacing-md);
			line-height: 1.5;
		}
	}
</style>
