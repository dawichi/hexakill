<script lang="ts">
    import '../app.css'
    import { Drawer, Range } from 'flowbite-svelte'
    import { sineIn } from 'svelte/easing'
    import { styles } from '$lib/config/styles'
    import PersonalRecords from '$lib/components/PersonalRecords.svelte'
    import Audio, { handleVolume } from '$lib/components/Audio.svelte'

    let volume = 0
    let hideDrawer = true
    let transitionParams = {
        x: -320,
        duration: 200,
        easing: sineIn,
    }

    function handleClickVolume(newVolume: number) {
        volume = newVolume
        handleVolume(newVolume)
    }

</script>

<!-- Displays everything in a centered block -->
<div class="container mx-auto pt-20 pb-10 lg:h-screen">
    <!-- Some UI elements such as title, menu, etc... -->
    <h1 class="absolute top-0 left-0 w-full p-5 text-center text-3xl tracking-widest">HEXAKILL</h1>
    <div class="absolute top-5 left-5 flex gap-2">
        <button class={styles.button.base + styles.button.blue} on:click={() => (hideDrawer = false)}>
            <i class="bi bi-list" />
        </button>
    </div>
    <Audio song="welcome" />
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

    <div class="flex items-center justify-center gap-4 p-2">
        <h6>Music</h6>
        <i class="bi bi-volume-mute-fill cursor-pointer p-1" on:click={() => handleClickVolume(0)} />
        <Range min={0} max={0.5} step={0.01} size="sm" bind:value={volume} on:change={() => handleVolume(volume)} />
        <i class="bi bi-volume-up-fill cursor-pointer p-1" on:click={() => handleClickVolume(0.5)} />
    </div>

    <div class="my-8" />

    <PersonalRecords />
</Drawer>
