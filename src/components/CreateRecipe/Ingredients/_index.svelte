<script lang="ts">
  import Item from "./Ingredient.svelte";
  import { lastId } from "./store";
  import { addItem, removeItem } from "../../../dynamic-list";
  import { Measurement } from './_types'

  let items = [{ id: 0 }];

  let measurementMode = Measurement.METRIC;

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

  const setMeasurementMode = (mode: Measurement) => {
    measurementMode = mode;
  };
</script>

<style lang="scss">
  @import "../../../style/theme.scss";

  .list {
    border-radius: $border-radius;
    background-color: $grey-dark1;
    margin-top: 10px;
    padding: 20px;
  }

  .faded {
    opacity: 30%;
  }

  .measurement-mode-btn {
    cursor: pointer;
    margin-left: 5px;
    font-size: small;
  }

  .measurement-mode-container {
    display: flex;
    justify-content: flex-end;
  }

</style>

<div>
  Ingredients
  <div class="list">

    <div class="measurement-mode-container">
      <label
        class="measurement-mode-btn"
        class:faded={measurementMode === Measurement.IMPERIAL}>
        Metric
        <button
          hidden
          on:click={() => setMeasurementMode(Measurement.METRIC)} />
      </label>

      <label
        class="measurement-mode-btn"
        class:faded={measurementMode === Measurement.METRIC}>
        Imperial
        <button
          hidden
          on:click={() => setMeasurementMode(Measurement.IMPERIAL)} />
      </label>
    </div>

    <Item measurementMode={measurementMode} />
    {#each items as item (item.id)}
      <Item id={item.id} measurementMode={measurementMode} on:input={addIngredient} on:clear={removeIngredient} />
    {/each}
  </div>
</div>
