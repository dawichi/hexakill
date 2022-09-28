<!--
    @component
    ## Starting component
    This component is used to enter the name of the player and select his character.
-->
<script lang="ts">
    import { player } from '$lib/data/stores'
    import { characters } from './config/characters'
    import { styles } from './config/styles'

    let nameInput: string = ''
    let characterSelected: number = 0

    function setName() {
        player.update(n => {
            n.name = nameInput
            return n
        })
    }

    function setCharacter() {
        player.update(n => {
            n.character = characterSelected
            return n
        })
    }
    characters
</script>

<section class="container mx-auto text-center pt-20">
    <div>
        <h2 class="text-xl pb-4">Enter your name:</h2>
        <input placeholder="Player name" bind:value={nameInput} class="bg-zinc-700 p-2 w-64 h-12 rounded" />
    </div>

    {#if nameInput.length >= 3}
        <p>opciones</p>
    {/if}

    <button class={styles.button.base + styles.button[characters[0].color]}>
        START GAME
    </button>

    <!-- <button on:click={setName} class={styles.button.base + styles.button.green + ' mt-5'}>
        CONFIRM
    </button> -->
</section>