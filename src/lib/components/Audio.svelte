<!--
  @component
  ## Audio
  Display the music
-->
<script lang="ts" context="module">
    const musics = new Set<HTMLAudioElement>()
    export let isPlaying = false

    function stopAll() {
        isPlaying = false
        musics.forEach(p => p.pause())
    }

    function startAll() {
        isPlaying = true
        musics.forEach(p => p.play())
    }

    export function handlePlay() {
        isPlaying ? stopAll() : startAll()
    }
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    type SongType = 'combat' | 'welcome'
    const songs: Record<SongType, string> = {
        combat: 'https://sveltejs.github.io/assets/music/satie.mp3',
        welcome: 'https://sveltejs.github.io/assets/music/satie.mp3',
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
