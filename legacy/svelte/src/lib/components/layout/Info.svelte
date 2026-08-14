<!--
  @component
  ## Info
  Display the info about how to play the game`
-->
<script lang="ts">
    import { Button, Modal } from '$lib/components'
    import { modalContext } from '$lib/data/modal'
</script>

<div class="absolute bottom-5 left-0 right-0 flex justify-center">
    <Button onClick={() => (modalContext.set(!$modalContext))}>
        <span class="flex items-center gap-2 text-xl font-bold">HOW TO PLAY</span>
    </Button>
</div>

<Modal title="HOW TO PLAY">
    <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        You will fight different enemies with its strengths and weaknesses.
        <br />
        Use the best strategy to survive as much as possible!
    </p>

    <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400 mt-4">
        In hexakill, there are 2 types of damage:
        <br />- <span class="text-red-400">Attacks (AD)</span> : <span class="text-red-400">10%</span> critic chance but
        <span class="text-red-400">10%</span>
        missing chance.
        <br />- <span class="text-blue-400">Magic (AP)</span> : <span class="text-blue-400">40%</span> critic chance but
        <span class="text-blue-400">30%</span> missing chance.
    </p>

    <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400 mt-4">
        It&apos;s up to you which one to prioritize! <br /> Remember that some enemies are stronger vs a specific type of damage!
    </p>

    <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400 mt-4">
        <span class="text-amber-400">Armor</span> and <span class="text-fuchsia-400">Magic Resist (MR)</span>{' '}
        reduces by a flat amount the damage received.
    </p>
</Modal>
