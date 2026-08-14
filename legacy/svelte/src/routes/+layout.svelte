<script lang="ts">
    import '../app.css'
    import { Drawer } from 'flowbite-svelte'
    import { sineIn } from 'svelte/easing'
    import Audio, { handleVolume } from '$lib/components/music/Audio.svelte'
    import { Button, Info, PersonalRecords, Timer, VolumeSlider } from '$lib/components'
    import { gameData } from '$lib/data/data'

    let hideDrawer = true
    let transitionParams = {
        x: -320,
        duration: 200,
        easing: sineIn,
    }

</script>

<!-- Displays everything in a centered block -->
<div class="container mx-auto pt-20 pb-10 lg:h-screen">
    <!-- Some UI elements such as title, menu, etc... -->
    <h1 class="absolute top-0 left-0 w-full p-5 text-center text-3xl tracking-widest">HEXAKILL</h1>
    <div class="absolute top-5 left-5 flex gap-2">
        <Button onClick={() => (hideDrawer = false)}>
            <span class="text-xl font-bold"><i class="bi bi-list" /></span>
        </Button>
    </div>

    {#if $gameData.view !== 'welcome' && $gameData.view !== 'champSelect'}
        <div class="absolute top-5 right-5">
            <Timer />
        </div>
    {/if}

    <Audio song={$gameData.view} />
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

    <VolumeSlider type="Music" />
    <VolumeSlider type="Effects" />

    <div class="my-8" />

    <PersonalRecords />

    <Info />
</Drawer>
