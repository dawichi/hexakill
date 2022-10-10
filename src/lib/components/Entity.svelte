<!--
  @component
  ## Entity
  Display the entity data
  @param type - The type of entity to display
-->
<script lang="ts">
    import Icon from '@iconify/svelte'
    import BgImage from './BgImage.svelte'
    import Tooltip from './Tooltip.svelte'
    import { gameData } from '$lib/data/data'
    import { styles } from '$lib/config/styles'
    import { StatIcons } from '$lib/config/statIcons'
    import { tooltipsService } from '$lib/services'
    import { Character, type Enemy } from '$lib/models'

    export let type: 'character' | 'enemy'
    let _entity: Character | Enemy

    gameData.subscribe(n => {
        const e = n[type]
        if (e) _entity = e
    })

    const colorHpBar = (hpWidth: number) => {
        if (hpWidth <= 10) return 'bg-red-600'
        if (hpWidth > 10 && hpWidth <= 40) return 'bg-yellow-600'
        return 'bg-green-600'
    }
</script>

<section class={styles.cell + 'animate__animated animate__fadeIn relative'}>
    <div class="h-full flex flex-col items-center justify-between">
        <h2 class="text-xl">
            {_entity.name} - lv {_entity.level}
        </h2>

        {#if _entity instanceof Character}
            <div class="bg-zinc-600/75 rounded-xl w-2/5">
                <div class="rounded-xl bg-cyan-500 h-1 transition-all duration-1000" style={`width: ${_entity['exp']}%`} />
            </div>
        {/if}

        <div class={'relative ' + _entity.size}>
            <BgImage image={`/images/${_entity.image}/idle.gif`} />
        </div>

        <div class="w-full flex flex-col items-center mb-5">
            <p class="flex justify-center items-center">
                {_entity.health - _entity.dmgReceived} / {_entity.health} <i class="ra ra-hearts text-red-600" />
            </p>
            <div class="bg-zinc-600/75 rounded-xl w-4/5 ">
                <div
                    class={`${colorHpBar(((_entity.health - _entity.dmgReceived) / _entity.health) * 100)} rounded-xl h-3 transition-all duration-500`}
                    style={`width: ${((_entity.health - _entity.dmgReceived) / _entity.health) * 100}%`}
                />
            </div>
        </div>
    </div>
    <div class="absolute top-0 left-0 m-5 rounded ">
        {#each StatIcons as stat}
            <div class="relative">
                <Tooltip
                    title={stat.name}
                    content={tooltipsService.getStatTooltip(stat.stat, _entity)}
                >
                    <p class="flex items-center text-lg p-1">
                        <span class="text-3xl">
                            <Icon icon={stat.icon} class={stat.style} />
                        </span>
                        <span class="pl-2">{_entity[stat.stat]}</span>
                    </p>
                </Tooltip>
            </div>
        {/each}
    </div>
</section>
