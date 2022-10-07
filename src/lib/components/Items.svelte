<!--
  @component
  ## Items
  Display a list of the items of your character
  @param items - the list of items to show
-->
<script lang="ts">
    import Item from '$lib/models/items/Item'
    import BgImage from './BgImage.svelte'
    const a = new Item({attribute: 'ap', bonus: 40}, 'orb7', 2)
    let _Items: Item[] = [a,a]
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
        <span>{item.upgrade.attribute} +{item.upgrade.bonus}</span>
      </p>
    </div>
  {/each}
</div>
