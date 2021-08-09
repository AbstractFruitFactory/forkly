<script lang="ts">
  import Instruction from "./Instruction.svelte";
  import { lastId } from "./store";

  import { addItem, removeItem } from "../../../dynamic-list";
  import RecipeImage from "../RecipeImage.svelte";

  let items = [{ id: 0 }];

  let counter = 0;

  const addIngredient = (event) => {
    const newItems = addItem(items, lastId, event);
    if (newItems) {
      items = newItems;
    }
  };
  const removeIngredient = (event) => {
    const newItems = removeItem(items, lastId, event);
    if (newItems) {
      items = newItems;
    }
  };
</script>

<div>
  Instructions
  <div>
    <Instruction number={1} />
    {#each items as item, i (item.id)}
      <Instruction
        number={i + 2}
        id={item.id}
        on:input={addIngredient}
        on:clear={removeIngredient} />
    {/each}
  </div>
</div>
