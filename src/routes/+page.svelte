<script lang="ts">
    import { gameData } from '$lib/data/stores'
    import Starting from '$lib/Starting.svelte'
    import Welcome from '$lib/Welcome.svelte'

    let isPlaying: boolean

    gameData.subscribe(n => {
        isPlaying = n.playing
    })
</script>

<div>
    {#if !isPlaying}
        <Welcome />
    {:else}
        <Starting />
    {/if}
</div>

<!-- <style lang="scss">
    // @import "node_modules/rpg-awesome/scss/rpg-awesome";
</style> -->