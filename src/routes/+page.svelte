<script lang="ts">
    import { gameData } from '$lib/data/data'
    import Combat from '$lib/views/Combat.svelte'
    import GameOver from '$lib/views/GameOver.svelte'
    import ChampSelect from '$lib/views/ChampSelect.svelte'
    import Store from '$lib/views/Store.svelte'
    import Welcome from '$lib/views/Welcome.svelte'

</script>

{#if $gameData.view === 'welcome'}
    <Welcome />
{:else if $gameData.view === 'champSelect'}
    <ChampSelect />
{:else if $gameData.view === 'combat'}
    <Combat />
{:else if $gameData.view === 'store'}
    <Store />
{:else if $gameData.view === 'gameover'}
    <GameOver />
{/if}
