<script lang="ts">
	import { setSlots } from '../+layout.svelte'

  let { children } = $props()

  setSlots({ content: children })
</script>
