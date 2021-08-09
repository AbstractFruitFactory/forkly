<script lang="ts">
  export let items: string[];
</script>

<style lang="scss">
  @import "../../style/theme.scss";
  .select {
    background-color: $grey-light1;
    border-radius: $border-radius;
    border: none;
  }
</style>

<select class="select">
  {#each items as item}
    <option>{item}</option>
  {/each}
</select>
