<!--
    @component
    ## Combat component
    The view of the actual game, where the user can fight enemies.
-->
<script lang="ts">
    import { gameData } from '$lib/data/stores'
    import EntityView from '$lib/EntityView.svelte'
    import type { Character } from '$lib/models'

    let player: Character | null

    gameData.subscribe(n => {
        player = n.character
    })
</script>

<div class="text-center container mx-auto">
    {#if player}
        <EntityView entity={player} />
    {/if}
</div>
