<!--
    @component
    ## Starting component
    This component is used to enter the name of the player and select his character.
-->
<script lang="ts">
    import BgImage from '$lib/components/BgImage.svelte'
    import { styles } from '$lib/config/styles'
    import { gameData } from '$lib/data/stores'
    import { characters } from '$lib/config/characters'
    import { Character } from '$lib/models'

    let _nameInput: string = ''
    let _character: number = -1

    gameData.subscribe(n => {
        _character = n.characterIdx
    })

    function setCharacter(idx: number) {
        gameData.update(n => {
            n.characterIdx = idx
            return n
        })
    }

    function start() {
        gameData.update(n => {
            n.step = 'playing'
            n.character = new Character(4, _nameInput, characters[_character])
            return n
        })
    }
</script>

<section class="container mx-auto text-center pt-20">
    <div>
        <h2 class="text-xl pb-4">Enter your name:</h2>
        <input placeholder="Player name" bind:value={_nameInput} class="bg-zinc-700 p-2 w-64 h-12 rounded" />
    </div>

    {#if _nameInput.length >= 3 && _nameInput.length <= 14}
        <h3 class="text-xl mt-10">Great! Now select your class.</h3>
        <div class="container mx-auto max-w-3xl grid lg:grid-cols-3">
            {#each characters as character, idx}
                <div
                    class={`${character.data.bg} m-2 p-4 cursor-pointer rounded-lg ${idx === _character ? character.data.shadow : ''}`}
                    on:click={() => setCharacter(idx)}
                >
                    <h4 class="text-xl">{character.name}</h4>
                    <hr class="my-2" />
                    <p>{character.data.desc}</p>
                    <p>({character.data.subDesc})</p>
                    <div class="relative m-auto mt-2 h-64 p-4">
                        <BgImage image={`/images/${character.name.toLocaleLowerCase()}/idle.gif`} />
                    </div>
                </div>
            {/each}
        </div>

        {#if _character > -1}
            <button on:click={start} class={'mt-16 ' + styles.button.base + styles.button[characters[_character]?.data.color]}> START GAME </button>
        {/if}
    {/if}
</section>
