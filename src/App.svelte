<script>
  import { Router, Route } from "svelte-routing"
  import Home from './components/Home.svelte'
  import CreateRecipe from './components/CreateRecipe/CreateRecipe.svelte'

  export let url = ''
</script>

<Router url={url}>
  <Route path="/">
    <Home />
  </Route>
  <Route path="/newrecipe" >
    <CreateRecipe />
  </Route>
</Router>