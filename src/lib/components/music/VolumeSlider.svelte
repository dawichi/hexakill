<!--
    @component
    ## Volume Slider
    Slider selector to 
    @param title - Title of the slider
    @param volume - Volume of the slider
-->
<script lang="ts">
    import { volumeContext } from '$lib/data/data'
    import { Range } from 'flowbite-svelte'
    import { handleVolume } from './Audio.svelte'

    export let type: 'Music' | 'Effects'

    let displayVolume = type === 'Music' ? $volumeContext.musicVolume : $volumeContext.effectsVolume

    function setVolume(newVolume: number): void {
        displayVolume = newVolume

        if (type === 'Music') {
            volumeContext.update(n => ({
                ...n,
                musicVolume: newVolume,
            }))
            return handleVolume(newVolume)
        }

        volumeContext.update(n => ({
            ...n,
            effectsVolume: newVolume,
        }))
    }
</script>

<div class="flex items-center justify-center gap-4 p-1">
    <h6>
        <p class="w-14">{type}</p>
    </h6>

    <button on:click={() => setVolume(0)}>
        <i class="bi bi-volume-mute-fill cursor-pointer p-1" />
    </button>
    <Range min={0} max={0.5} step={0.01} size="sm" bind:value={displayVolume} on:change={() => setVolume(displayVolume)} />
    <button on:click={() => setVolume(0.5)}>
        <i class="bi bi-volume-up-fill cursor-pointer p-1" />
    </button>
</div>
