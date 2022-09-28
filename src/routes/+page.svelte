<script lang="ts">
    import { playing } from '$lib/data/stores'
    import Starting from '$lib/Starting.svelte'
    import Welcome from '$lib/Welcome.svelte'

    let isPlaying: boolean

    playing.subscribe(value => {
        isPlaying = value
    })
</script>

<div>
    {#if !isPlaying}
        <Welcome />
    {:else}
        <Starting />
    {/if}
</div>
