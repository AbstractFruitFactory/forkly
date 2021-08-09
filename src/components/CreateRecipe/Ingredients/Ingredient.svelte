<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { lastId } from "./store";
  import { fade, onInput } from "../../../dynamic-list";
  import Select from "../../shared/Select.svelte";
  import { Measurement } from "./_types";
  import { ingredients } from '../../../newRecipeStore'

  export let id: number = undefined;
  export let measurementMode: Measurement = Measurement.METRIC;

  const dispatch = createEventDispatcher();

  //getFood()

  let lastItemId;

  $: measurements =
    measurementMode === Measurement.METRIC
      ? ["tsp", "tbsp", "liter", "cl", "ml"]
      : ["oz", "cups", "lb", "gallons"];

  lastId.subscribe((id) => {
    lastItemId = id;
  });

  const inputs = [
    {
      value: "",
      placeholder: "Ingredient",
    },
    {
      value: "",
      placeholder: "Quantity",
    },
  ];

  const onIngredientInput = () => {
    ingredients.update(ingredients => {
      let newIngredients = ingredients

      newIngredients[id] = {
        name: inputs[0].value,
        quantity: parseInt(inputs[1].value),
        measurement: '<placeholder>'
      }

      return newIngredients
    })

    return onInput.bind(
      null,
      dispatch,
      id,
      () => inputs[0].value === "" && inputs[1].value === ""
    )()
  }
</script>

<div
  class={lastItemId === id ? "faded item" : "item"}
  in:fade={{ enabled: lastItemId === id }}
  on:input={onIngredientInput}
>
  <input
    bind:value={inputs[0].value}
    type="text"
    placeholder={inputs[0].placeholder}
  />
  <input
    bind:value={inputs[1].value}
    type="number"
    placeholder={inputs[1].placeholder}
  />

  <Select items={measurements} />
</div>

<style lang="scss">
  .faded {
    opacity: 0.2;
  }

  .item {
    display: grid;
    grid: 1fr / 1fr 1fr 1fr;
    margin-bottom: 10px;
  }
</style>
