<script lang="ts">
	import AlertCircle from 'lucide-svelte/icons/alert-circle'

	let { text }: { text: string } = $props()
</script>

<div class="hint-callout">
	<div class="hint-icon">
		<AlertCircle size={18} />
	</div>
	<div class="hint-text">{text}</div>
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.hint-callout {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-sm);
		background: var(--color-info-light);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-left: 4px solid var(--color-info);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-sm) var(--spacing-md);
	}

	.hint-icon {
		color: var(--color-primary);
		margin-top: 2px;
	}

	.hint-text {
		color: var(--color-text-on-surface);
		line-height: 1.5;
		font-size: var(--font-size-sm);
		font-style: italic;
	}
</style>
