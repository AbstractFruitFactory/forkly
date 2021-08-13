<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { lastId } from "./store";
  import { fade, onInput } from "../../../dynamic-list";
  import RecipeImage from "../RecipeImage.svelte";

  export let number: number;
  export let id = undefined;

  const dispatch = createEventDispatcher();

  const item = {
    value: "",
  };

  let lastItemId;

  lastId.subscribe((id) => {
    lastItemId = id;
  });

  const onInstructionInput = onInput.bind(
    null,
    dispatch,
    id,
    () => item.value === ""
  );
</script>

<style lang="scss">
  @import "../../../style/theme.scss";
  .box {
    border-radius: $border-radius;
    background-color: $grey-dark1;
    margin-top: 10px;
    padding: 20px;
  }

  .left-section {
    grid-column-start: 1;
  }

  .right-section {
    grid-column-start: 2;
  }

  .container {
    display: grid;
    row-gap: 30px;
    grid: auto / 2fr 1fr;
  }

  .faded {
    opacity: 0.2;
  }

  .rounded {
    border: 1px solid $accent-dark1;
    border-radius: 8px;
    margin: 20px 50px;
    opacity: 30%;
  }

  .recipe-image {
    display: flex;
  }

  [contenteditable]:focus {
    outline: 0px solid transparent;
  }

  .textarea { 
    max-width: 520px;
  }
</style>

<div
  in:fade={{ enabled: lastItemId === id }}
  on:input={onInstructionInput}
  class={lastItemId === id ? 'faded instruction container' : 'instruction container'}>
  {number}
  <div class="left-section">
    <div class="box">
      <div
        class="textarea"
        contenteditable
        type="text"
        placeholder="Add instructions"
        bind:textContent={item.value} />
    </div>
    <hr class="rounded" />
  </div>
  <div class="right-section recipe-image">
    <RecipeImage />
  </div>
</div>
