<!--
    @component
    ## Starting component
    This component is used to enter the name of the player and select his character.
-->
<script lang="ts">
    import { player } from '$lib/data/stores'
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
</script>

<section class="container mx-auto text-center pt-20">
    <div>
        <h2 for="name" class="text-xl pb-4">Enter your name:</h2>
        <input type="text" id="name" placeholder="Player name" bind:value={nameInput} class="bg-zinc-700 p-2 w-64 h-12 rounded" />
    </div>
    <button on:click={setName} class={styles.button.base + styles.button.green + ' mt-5'}>
        CONFIRM
    </button>
</section>