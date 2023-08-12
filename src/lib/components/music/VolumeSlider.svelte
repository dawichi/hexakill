<!--
    @component
    ## Volume Slider
    Slider selector to 
    @param title - Title of the slider
    @param volume - Volume of the slider
-->
<script lang="ts">
    import { volume } from '$lib/data/data'
    import { Range } from 'flowbite-svelte'
    import { handleVolume } from './Audio.svelte'

    export let type: 'Music' | 'Effects'

    let displayVolume = type === 'Music' ? $volume.musicVolume : $volume.effectsVolume

    function setVolume(newVolume: number): void {
        displayVolume = newVolume

        if (type === 'Music') {
            volume.update(n => ({
                ...n,
                musicVolume: newVolume,
            }))
            // Music needs to be handled with it's own custom function
            handleVolume(newVolume)
            return
        }

        volume.update(n => ({
            ...n,
            effectsVolume: newVolume,
        }))
    }
</script>

<div class="flex items-center justify-center gap-4 p-1">
    <h6 class="w-14">
        {type}
    </h6>

    <button on:click={() => setVolume(0)}>
        <i class="bi bi-volume-mute-fill cursor-pointer p-1" />
    </button>

    <Range min={0} max={0.5} step={0.01} size="sm" bind:value={displayVolume} on:change={() => setVolume(displayVolume)} />

    <button on:click={() => setVolume(0.5)}>
        <i class="bi bi-volume-up-fill cursor-pointer p-1" />
    </button>
</div>
