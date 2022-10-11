<script lang="ts">
    import BgImage from '$lib/components/BgImage.svelte'
    import Tooltip from '$lib/components/Tooltip.svelte'
    import { StatIcons } from '$lib/config/statIcons'
    import { styles } from '$lib/config/styles'
    import { gameData } from '$lib/data/data'
    import type { Character, Enemy } from '$lib/models'
    import Icon from '@iconify/svelte'
    import Entity from '$lib/components/Entity.svelte'
    
    import { items } from '$lib/config/items'
    import Item from '$lib/models/Item'
    import { tooltipsService } from '$lib/services'
    let _Items: Item[] = []
    for (const item of items) {
        _Items.push(new Item(item.name, 1, item.bonus))
    }

    let _entity: Character
    let _enemy: Enemy

    gameData.subscribe(n => {
        if (n.character) _entity = n.character
        if (n.enemy) _enemy = n.enemy
    })

    const colorHpBar = (hpWidth: number) => {
        if (hpWidth <= 10) return 'bg-red-600'
        if (hpWidth > 10 && hpWidth <= 40) return 'bg-yellow-600'
        return 'bg-green-600'
    }

    function openCombat(): void {
        gameData.update(n => {
            n.view = 'combat'
            return n
        })
    }
    function onKeyDown(event: KeyboardEvent): void {
        if (event.code === 'KeyP') openCombat()
        return
    }
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<div class="animate__animated animate__fadeIn bg-zinc-900 lg:h-screen px-8 pt-20 pb-10 relative">
    <button on:click={openCombat} class={styles.button.base + styles.button.red}> Arena </button>
    <div class="h-screen flex flex-col justify-center items-center grid lg:grid-cols-3 grid-gap-20">
        <h1 class="absolute top-0 text-3xl p-5 text-center w-full tracking-widest">HEXASTORE</h1>
        <div>

            <h1 class="flex justify-center text-2xl  text-amber-600">Character info:</h1>
            <Entity type="character" />
        </div>

        <section>
            <button on:click={openCombat} class={styles.button.base + styles.button.red}> WIP, don't touch </button>
            <button on:click={openCombat} class={styles.button.base + styles.button.red}> arena right now </button>
        </section>

        <section class="relative grid lg:grid-cols-2">
            {#each _Items as item}
                <span class="flex items-center w-20 h-20">
                    <span>{item.name} lv {item.tier}</span>
                    <BgImage image={`/images/items/${item.image}.png`} />

                    <!-- Todo lo del tooltip inventado para probar como se veia -->
                    <!-- <Tooltip title={item.name} content={tooltipsService.getStatTooltip(item.name, _entity)}>
                            <p class="flex items-center text-lg p-30">
                                <span class="text-xl">
                                    <Icon icon={item.image} class={item.image} />
                                </span>
                                <span class="pl-2">{[item.name]}</span>
                            </p>
                        </Tooltip> -->
                </span>
            {/each}
        </section>
    </div>
</div>
