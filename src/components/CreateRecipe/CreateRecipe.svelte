<script lang="ts">
  import Ingredients from "./Ingredients/_index.svelte";
  import Utensils from "./Utensils.svelte";
  import Instructions from "./Instructions/index.svelte";
  import RecipeImage from "./RecipeImage.svelte";
  import CreateRecipeBtn from "./CreateRecipeBtn.svelte";
</script>

<div class="box">
  <CreateRecipeBtn />
  <div class="container">
    <input class="title" placeholder="Recipe title" />

    <div class="left-section">
      <Ingredients />
    </div>

    <div class="right-section recipe-image">
      <RecipeImage />
    </div>

    <div class="left-section">
      <Utensils />
    </div>
  </div>

  <div>
    <Instructions />
  </div>
</div>

<style lang="scss">
  @import "../../style/theme.scss";

  .box {
    background-color: $accent_dark2;
    height: 100%;
    padding: 30px;
    border-radius: $border-radius;
    max-width: 1000px;
    margin-bottom: 50px;
  }

  .container {
    display: grid;
    row-gap: 30px;
    grid: auto / 2fr 1fr;
    margin-bottom: 40px;
  }

  .left-section {
    grid-column-start: 1;
  }

  .right-section {
    grid-column-start: 2;
  }

  .title {
    font-size: 35px;
  }

  .recipe-image {
    display: flex;
  }
</style>
