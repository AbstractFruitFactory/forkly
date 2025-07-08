<script lang="ts">
	import AlertTriangle from 'lucide-svelte/icons/alert-triangle'

	let { message }: { message: string } = $props()
</script>

<div class="warning-box">
	<div class="warning-icon">
		<AlertTriangle size={16} />
	</div>
	<p>{message}</p>
</div>

<style lang="scss">
	.warning-box {
		background: var(--color-error-light);
		border: var(--border-width-normal) solid var(--color-error-dark);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-md);
		margin-top: var(--spacing-xs);
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-sm);
		box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
		animation: slideIn 0.2s ease-out;

		.warning-icon {
			flex-shrink: 0;
			color: var(--color-text-on-error);
			margin-top: 2px;
		}

		p {
			margin: 0;
			font-size: var(--font-size-sm);
			color: var(--color-text-on-primary);
			line-height: 1.4;
			font-weight: var(--font-weight-medium);
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
