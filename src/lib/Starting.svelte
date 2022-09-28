<!--
    @component
    ## Starting component
    This component is used to enter the name of the player and select his character.
-->
<script lang="ts">
    import { gameData } from '$lib/data/stores'
    import { characters } from './config/characters'
    import { styles } from './config/styles'

    let nameInput: string = ''
    let characterSelected: number = -1
    

    gameData.subscribe(n => {
        characterSelected = n.character
    })

    function setName() {
        gameData.update(n => {
            n.username = nameInput
            return n
        })
    }

    function setCharacter(idx: number) {
        gameData.update(n => {
            n.character = idx
            return n
        })
    }

    // function setCharacter() {
    //     gameData.update(n => {
    //         n.character = characterSelected
    //         return n
    //     })
    // }
</script>

<section class="container mx-auto text-center pt-20">
    <div>
        <h2 class="text-xl pb-4">Enter your name:</h2>
        <input placeholder="Player name" bind:value={nameInput} class="bg-zinc-700 p-2 w-64 h-12 rounded" />
    </div>

    {#if nameInput.length >= 3}
        <h3 class='text-xl mt-10'>Great! Now select your class.</h3>
        {#each characters as character, idx}
            <div
                class={`${character.bg} m-2 p-4 cursor-pointer rounded-lg ${++idx === characterSelected ? character.shadow : ''}`}
                on:click={() => setCharacter(idx + 1)}
            >
                <h4 class='text-xl'>{character.name}</h4>
                <hr class='my-2' />
                <p>{character.desc}</p>
                <p>({character.subDesc})</p>
                <div class={`relative m-auto mt-2 ${character.size}`}>
                    <img
                        src={`/images/${character.imgPath}/idle.gif`}
                        alt={character.name}
                    />
                </div>
            </div>
        {/each}
    {/if}

    <button class={styles.button.base + styles.button[characters[0].color]}>
        START GAME
    </button>

    <!-- <button on:click={setName} class={styles.button.base + styles.button.green + ' mt-5'}>
        CONFIRM
    </button> -->
</section>