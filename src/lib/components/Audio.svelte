<!--
  @component
  ## Audio
  Display the music
-->
<script lang="ts" context="module">
    import { gameData } from '$lib/data/data'

    const musics = new Set<HTMLAudioElement>()

    export function handleVolume(volume: number) {
        musics.forEach(p => {
            p.volume = volume
            p.play()
        })
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
