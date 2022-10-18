<!--
  @component
  ## Audio
  Display the music
-->
<script lang="ts" context="module">
    import { gameData } from '$lib/data/data'
    import type { GameDTO } from '$lib/types/Game.dto'

    const musics = new Set<HTMLAudioElement>()

    let _data: GameDTO
    gameData.subscribe(n => (_data = n))

    export function handlePlay() {
        if (_data.showUI.musicActive) {
            musics.forEach(p => p.pause())
        } else {
            musics.forEach(p => p.play())
        }
        gameData.update(n => ({ ...n, showUI: { ...n.showUI, musicActive: !n.showUI.musicActive } }))
    }

    export function handleVolume(volume: number) {
        musics.forEach(p => (p.volume = volume))
        gameData.update(n => ({ ...n, showUI: { ...n.showUI, musicVolume: volume } }))
    }
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    type SongType = 'combat' | 'welcome'
    const songs: Record<SongType, string> = {
        welcome: '/music/welcome.mp3',
        combat: 'https://sveltejs.github.io/assets/music/satie.mp3',
    }
    export let song: SongType

    let music: HTMLAudioElement

    onMount(() => {
        musics.add(music)
    })
</script>

<div>
    <audio bind:this={music} src={songs[song]} loop>
        <track kind="captions" />
    </audio>
</div>
