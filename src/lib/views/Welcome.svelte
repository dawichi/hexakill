<!--
    @component
    ## Welcome component
    This component is used to welcome the user to the game.
-->
<script lang="ts">
    import { handleVolume } from '$lib/components/music/Audio.svelte'
    import { gameData } from '$lib/data/data'
    import { Button } from 'flowbite-svelte'

    function startPlaying() {
        handleVolume(0.1)
        gameData.update(n => {
            n.view = 'champSelect'
            return n
        })
    }
</script>

<div class="container mx-auto text-center">
    <h1 class="py-10 text-4xl">Welcome to the hexakill game!</h1>
    <hr class="mx-auto w-4/5" />

    <p class="text-xl text-green-400">HOW TO PLAY</p>
    <p>
        Win combats to <span class="text-cyan-400">level up</span> your character and improve its stats 💪🏻.
    </p>
    <p>
        You will fight different enemies with its strengths and weaknesses.
        <br />
        Use the best strategy to survive as much as possible!
    </p>
    <p>
        In hexakill, there are 2 types of damage:
        <br />- <span class="text-red-400">Attacks (AD)</span> : <span class="text-red-400">10%</span> critic chance but
        <span class="text-red-400">10%</span>
        missing chance.
        <br />- <span class="text-blue-400">Magic (AP)</span> : <span class="text-blue-400">40%</span> critic chance but
        <span class="text-blue-400">30%</span> missing chance.
    </p>
    <p>
        It&apos;s up to you which one to prioritize! <br /> Remember that some enemies are stronger vs a specific type of damage!
    </p>
    <p>
        <span class="text-amber-400">Armor</span> and <span class="text-fuchsia-400">Magic Resist (MR)</span>{' '}
        reduces by a flat amount the damage received.
    </p>

    <br />
    <br />
    <br />

    <Button gradient color="blue" on:click={startPlaying}>
        <span class="text-xl font-bold tracking-wider">START</span>
    </Button>
</div>

<style>
    p {
        padding-top: 40px;
    }
</style>
