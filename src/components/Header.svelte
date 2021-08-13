<script lang="ts">
  import SearchBox from "../components/SearchBox.svelte";
  import NewRecipeBtn from "./NewRecipeBtn.svelte";
</script>

<style lang="scss">
  @import "../style/theme.scss";
  
  .container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
  .logo {
    font-family: "Courgette", cursive;
    text-decoration: underline;
    font-size: 40px;
    font-weight: bold;
    color: $main;
    text-shadow: 2px 2px 2px black;
    flex-grow: 6;
  }
  .button {
    flex-grow: 1;
  }
  .searchBox {
    flex-grow: 1;
  }
</style>

<div class="container">
  <div class="logo">Forkly</div>
  <div class="button">
    <NewRecipeBtn />
  </div>
  <div class="searchBox">
    <SearchBox />
  </div>
</div>

<slot></slot>