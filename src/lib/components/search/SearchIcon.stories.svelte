<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import SearchIcon from './SearchIcon.svelte'
  import Button from '../button/Button.svelte'

  const { Story } = defineMeta({
    component: SearchIcon,
    title: 'lib/components/SearchIcon',
    tags: ['autodocs']
  })

  let isClear = $state(false);
  let size = 24;
  let color = '#333333';

  function toggleIcon() {
    console.log('toggleIcon')
    isClear = !isClear;
  }
</script>

<Story name="Default">
  {#snippet children(args)}
    <div class="flex flex-col items-center gap-4">
      <SearchIcon {isClear} {size} {color} />
      <Button onclick={toggleIcon}>
        Toggle to {isClear ? 'Search' : 'Clear'} Icon
      </Button>
    </div>
  {/snippet}
</Story>