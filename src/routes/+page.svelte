<script lang="ts">
    import { playing } from '$lib/data/stores'
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
        <h1>Step 1</h1>
    {/if}
</div>
