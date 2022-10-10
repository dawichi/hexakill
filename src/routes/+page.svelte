<script lang="ts">
    import { gameData } from '$lib/data/data'
    import Combat from '$lib/views/Combat.svelte'
    import GameOver from '$lib/views/GameOver.svelte'
    import ChampSelect from '$lib/views/ChampSelect.svelte'
    import Store from '$lib/views/Store.svelte'
    import Welcome from '$lib/views/Welcome.svelte'

    let view: string

    gameData.subscribe(n => {
        view = n.view
    })
</script>

<div>
    {#if view === 'welcome'}
        <Welcome />
    {:else if view === 'champSelect'}
        <ChampSelect />
    {:else if view === 'combat'}
        <Combat />
    {:else if view === 'store'}
        <Store />
    {:else if view === 'gameover'}
        <GameOver />
    {/if}
</div>
