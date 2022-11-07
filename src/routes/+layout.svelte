<script lang="ts">
    import '../app.css'
    import { Button, Drawer } from 'flowbite-svelte'
    import { sineIn } from 'svelte/easing'
    import Audio, { handleVolume } from '$lib/components/music/Audio.svelte'
    import PersonalRecords from '$lib/components/PersonalRecords.svelte'
    import VolumeSlider from '$lib/components/music/VolumeSlider.svelte'
    import { Info, Timer } from '$lib/components'
    import type { GameDTO } from '$lib/types/Game.dto'
    import { gameData } from '$lib/data/data'

    let hideDrawer = true
    let transitionParams = {
        x: -320,
        duration: 200,
        easing: sineIn,
    }

    let _data: GameDTO
    gameData.subscribe(n => (_data = n))
</script>

<!-- Displays everything in a centered block -->
<div class="container mx-auto pt-20 pb-10 lg:h-screen">
    <!-- Some UI elements such as title, menu, etc... -->
    <h1 class="absolute top-0 left-0 w-full p-5 text-center text-3xl tracking-widest">HEXAKILL</h1>
    <div class="absolute top-5 left-5 flex gap-2">
        <Button class="!px-4 !py-3" gradient color="blue" on:click={() => (hideDrawer = false)}>
            <span class="text-xl font-bold"><i class="bi bi-list" /></span>
        </Button>
    </div>
    <div class="absolute top-5 right-5">
        <Timer />
    </div>
    <Audio song={_data.view} />
    <main class="h-full">
        <slot />
    </main>
</div>

<!-- Drawer of the app -->
<Drawer transitionType="fly" divClass="overflow-y-auto z-50 p-4 bg-zinc-900" bgColor="glassmorphism" {transitionParams} bind:hidden={hideDrawer} id="sidebar1">
    <div class="mb-2 flex items-center justify-between">
        <h5 class="text-xl"><i class="bi bi-info-circle-fill" /> Menu</h5>
        <button class="hover: text-xl transition" on:click={() => (hideDrawer = true)}><i class="bi bi-x-lg" /></button>
    </div>
    <hr class="mb-4" />

    <VolumeSlider title="Music" />
    <VolumeSlider title="Effects" />

    <div class="my-8" />

    <PersonalRecords />

    <Info />
</Drawer>
