<!--
  @component
  ## Items
  Display a list of the items of your character
  @param items - the list of items to show
-->
<script lang="ts">
    import { gameData } from "$lib/data/data"
    import type { GameDTO } from "$lib/types/Game.dto"

    let _data: GameDTO
    gameData.subscribe(n => _data = n)
</script>

<div class="flex flex-col gap-2 p-2">
    <p>Items</p>
    <hr />
    {#if _data.character}
    {#each _data.character.inventory.items as item}
        <p>{item.name}</p>
        {#each Object.entries(_data.character.inventory.totalBonus) as bonus}
            <span>{bonus[0]}: {bonus[1]}</span>
        {/each}
    {/each}
    {/if}
</div>
