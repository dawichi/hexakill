<!--
  @component
  ## Items
  Display a list of the items of your character
  @param items - the list of items to show
-->
<script lang="ts">
    import BgImage from './BgImage.svelte'
    import Item from '$lib/models/Item'
    import { items } from '$lib/config/items'

    let _Items: Item[] = []

    for (const item of items) {
      _Items.push(new Item(item.name,1, 1000, item.bonus))
    }
</script>

<div class="flex flex-col gap-2 p-2">
  <p>
      <span class="text-center">Current Items</span>  
  </p>
  <hr />

  {#each _Items as item}
    <div class="grid lg:grid-cols-2">
      <span class='flex items-center w-16 h-16'>
        <BgImage image={`/images/items/${item.image}.png`} />
      </span>
      <p class="flex flex-col items-center">
        <span>{item.name} lv {item.tier}</span>
      </p>
    </div>
  {/each}
</div>
