<script lang="ts">
    import { gameData } from '$lib/data/stores'
    import Combat from '$lib/views/Combat.svelte'
    import Starting from '$lib/views/Starting.svelte'
    import Welcome from '$lib/views/Welcome.svelte'

    let step: string

    gameData.subscribe(n => {
        step = n.step
    })
</script>

<div>
    {#if step === 'welcome'}
        <Welcome />
    {:else if step === 'starting'}
        <Starting />
    {:else if step === 'playing'}
        <Combat />
    {/if}
</div>
