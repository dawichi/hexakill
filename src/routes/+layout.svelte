<script lang="ts">
    import '../app.css'
    import { Drawer } from 'flowbite-svelte'
    import { sineIn } from 'svelte/easing'
    import { styles } from '$lib/config/styles'
    import PersonalRecords from '$lib/components/PersonalRecords.svelte'
    import Audio, { handlePlay } from '$lib/components/Audio.svelte'
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
    <div class="absolute top-5 left-5 flex gap-4">
        <button class={styles.button.base + styles.button.blue} on:click={() => (hideDrawer = false)}>
            <i class="bi bi-list" />
        </button>
        <button class={styles.button.base + styles.button.blue} on:click={handlePlay}>
            <i class={_data.showUI.music ? 'bi bi-volume-up-fill' : 'bi bi-volume-mute-fill'} />
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

    <PersonalRecords />
</Drawer>
