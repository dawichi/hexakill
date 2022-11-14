<!--
  @component
  ## Audio
  Display the music
-->
<script lang="ts" context="module">
    const musics = new Set<HTMLAudioElement>()

    /**
     * Handle the volume of the music
     * @param volume The volume to set
     */
    export const handleVolume = (volume: number) =>
        musics.forEach(p => {
            if (volume === 0) p.pause()
            if (volume > 0) p.play()
            p.volume = volume
        })
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    type SongType = 'combat' | 'welcome' | 'store' | 'champSelect' | 'gameover' | 'champSelect'
    const songs: Record<SongType, string> = {
        welcome: '',
        combat: '/music/dungeon.mp3',
        store: '/music/store.mp3',
        champSelect: '/music/champSelect.mp3',
        gameover: '/music/welcome.mp3',
    }
    export let song: SongType

    let music: HTMLAudioElement

    onMount(() => {
        musics.add(music)
    })
</script>

<div>
    <audio bind:this={music} src={songs[song]} loop autoplay>
        <track kind="captions" />
    </audio>
</div>
