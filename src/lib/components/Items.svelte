<!--
  @component
  ## Items
  Display a list of the items of your character
  @param items - the list of items to show
-->
<script lang="ts">
    import { gameData } from '$lib/data/data'
</script>

<div class="flex flex-col gap-2 p-2">
    <p>Items</p>
    <hr />
    {#if $gameData.character}
        {#each $gameData.character.inventory.items as item}
            <p>{item.name}</p>
        {/each}
        
        {#each Object.entries($gameData.character.inventory.totalBonus) as bonus}
            <span>{bonus[0]}: {bonus[1]}</span>
        {/each}
    {/if}
</div>
