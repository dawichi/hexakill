<!--
    @component
    ## Champ Select component
    This component is used to enter the name of the player and select his character.
-->
<script lang="ts">
    import { Button, Image } from '$lib/components'
    import { gameData } from '$lib/data/data'
    import { characters } from '$lib/config/characters'
    import { CharacterModel } from '$lib/models'

    let _nameInput: string = ''
    let character_idx: number = -1

    function start() {
        gameData.update(n => {
            n.view = 'combat'
            n.character = new CharacterModel(4, _nameInput, characters[character_idx])
            return n
        })
    }
</script>

<section class="container mx-auto pt-8 text-center">
    <div>
        <h2 class="pb-4 text-xl">Enter your name:</h2>
        <!-- svelte-ignore a11y-autofocus -->
        <input placeholder="Player name" bind:value={_nameInput} class="h-12 w-64 rounded bg-zinc-700 p-2" autofocus />
    </div>

    {#if _nameInput.length >= 3 && _nameInput.length <= 14}
        <h3 class="mt-10 text-xl">Great! Now select your class.</h3>
        <div class="container mx-auto grid max-w-3xl lg:grid-cols-3">
            {#each characters as character, idx}
                <button
                    class={`${character.data.bg} m-2 p-4 cursor-pointer rounded-lg ${idx === character_idx ? character.data.shadow : ''}`}
                    on:click={() => character_idx = idx}
                >
                    <h4 class="text-xl">{character.name}</h4>
                    <hr class="my-2" />
                    <p>{character.data.desc}</p>
                    <p>({character.data.subDesc})</p>
                    <div class="relative m-auto mt-2 h-64 p-4">
                        <Image image={`/images/${character.name.toLocaleLowerCase()}/idle.gif`} />
                    </div>
                </button>
            {/each}
        </div>

        {#if character_idx > -1}
            <Button color={characters[character_idx]?.data.color} onClick={start} style="my-16">
                <span class="gap-2 text-xl font-bold tracking-wider">START GAME</span>
            </Button>
        {/if}
    {/if}
</section>
