<script lang="ts">
    import Button from '../shared/Button.svelte'
    import { navigate } from "svelte-routing";
  </script>
  
  <Button onClick={() => navigate('./createrecipe')}>Create</Button>
  