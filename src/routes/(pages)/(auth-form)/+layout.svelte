<script lang="ts">
	let { children } = $props()
</script>

<div>
	{@render children()}
</div>

<style>
	div {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
