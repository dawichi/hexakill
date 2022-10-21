<!--
    @component
    ## Volume Slider
    Slider selector to 
    @param title - Title of the slider
    @param volume - Volume of the slider
-->
<script lang="ts">
    import { gameData } from '$lib/data/data'
    import type { GameDTO } from '$lib/types/Game.dto'
    import { Range } from 'flowbite-svelte'
    import { handleVolume } from './Audio.svelte'

    export let title: 'Music' | 'Effects'

    let _volume: number
    let _data: GameDTO
    gameData.subscribe(n => {
        _data = n
        _volume = title === 'Music' ? _data.sound.musicVolume : _data.sound.effectsVolume
    })

    function handleClick(newVolume: number): void {
        _volume = newVolume
        if (title === 'Music') {
            gameData.update(n => ({...n, sound: {...n.sound, musicVolume: newVolume}}))
            return handleVolume(newVolume)
        }
        gameData.update(n => ({...n, sound: {...n.sound, effectsVolume: newVolume}}))
    }
</script>

<div class="flex items-center justify-center gap-4 p-1">
    <h6>
        <p class="w-14">{title}</p>
    </h6>
    <i class="bi bi-volume-mute-fill cursor-pointer p-1" on:click={() => handleClick(0)} />
    <Range min={0} max={0.5} step={0.01} size="sm" bind:value={_volume} on:change={() => handleClick(_volume)} />
    <i class="bi bi-volume-up-fill cursor-pointer p-1" on:click={() => handleClick(0.5)} />
</div>
