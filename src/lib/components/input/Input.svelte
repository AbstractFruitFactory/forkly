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
		padding: 8px 12px;
		border: 1px solid var(--color-neutral);
		border-radius: 4px;
		font-family: var(--font-sans);
		transition: all 0.2s ease;
		background-color: var(--color-neutral-lighter);
		color: var(--color-neutral-dark);
		height: 40px;
		font-size: 16px;

		&:focus {
			outline: none;
			border-color: var(--color-primary);
			box-shadow: 0 0 0 2px var(--color-primary-light);
		}
	}

	.input-wrapper :global(input) {
		@include input-base;
	}

	.input-wrapper :global(select) {
		@include input-base;
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		padding-right: 36px;
	}

	.input-wrapper :global(textarea) {
		@include input-base;
		resize: none;
		height: 100px;
		padding: 12px;
	}
</style>
