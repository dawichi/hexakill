<!--
  @component
  ## BgImage
  Display an image using `background-image` instead of `<img/>`
-->
<script lang="ts">
    import Icon from '@iconify/svelte'
    import { gameData } from '$lib/data/data'
    import { getPowerupProp, powerups } from '$lib/config/powerups'
    import type { GameDTO } from '$lib/types/Game.dto'

    // Values binded to global store
    let _data: GameDTO

    // Bind values
    gameData.subscribe(n => (_data = n))

    /**
     * ## Get Bonus
     * Increment powerup values each time
     * @param base Base value
     * @param quantity Quantity of powerups
     */
    function getBonus(base: string | number, quantity: number): number {
        base = parseInt(base as string)
        return parseInt((base * 1.5 ** (quantity ?? 0)).toFixed(0))
    }

    function getAccBonus(stat: string, quantity: number): number {
        const base = getPowerupProp(stat, 'value')
        if (typeof base === 'string') throw new Error('Invalid value')
        let total = 0
        for (let i = 0; i < quantity; i++) {
            total += getBonus(base, i)
        }
        return total
    }

    function handlePowerUp(type: 'health' | 'ad' | 'ap' | 'speed', value: number): void {
        if (!_data.character) return
        _data.powerUps.pending -= 1
        if (!_data.powerUps.history[type]) {
            _data.powerUps.history[type] = 0
        }
        _data.character[type] += getBonus(value, _data.powerUps.history[type])
        _data.powerUps.history[type] += 1
        gameData.update(d => d)
    }

    function safe(type: 'health' | 'ad' | 'ap' | 'speed', value: number) {
        if ((_data.powerUps.history[type] ?? 0) < 6) handlePowerUp(type, value)
    }
    function onKeyDown(event: KeyboardEvent): void {
        if (!_data.powerUps.pending) return
        const codes: { [key: string]: () => void } = {
            1: () => safe('health', 500),
            2: () => safe('ad', 40),
            3: () => safe('ap', 50),
            4: () => safe('speed', 10),
        }
        codes[event.key]()
    }
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<div>
    <div class="grid grid-cols-4 gap-3 p-4">
        {#each Object.keys(_data.powerUps.history) as powerupKey}
            <div class="flex flex-col items-start p-1 rounded bg-zinc-700">
                <div class="flex items-center">
                    <span class="text-3xl mr-4">
                        <Icon icon={getPowerupProp(powerupKey, 'icon')} class={getPowerupProp(powerupKey, 'style')} />
                    </span>
                    {#each [...Array(_data.powerUps.history[powerupKey]).keys()] as _}
                        <span class="text-yellow-400"><Icon icon="ant-design:star-filled" /></span>
                    {/each}
                </div>
                <span>{'+' + getAccBonus(powerupKey, _data.powerUps.history[powerupKey])}</span>
            </div>
        {/each}
    </div>
    {#if _data.powerUps.pending}
        <h3 class="text-xl">Choose an upgrade!</h3>
        <h4>Pending: {_data.powerUps.pending}</h4>
        <hr class="m-2" />
        <div class="grid lg:grid-cols-3 gap-4 p-2">
            {#each powerups as powerup}
                {#if !_data.powerUps.history[powerup.type] || _data.powerUps.history[powerup.type] < 6}
                    <div>
                        <button
                            on:click={() => handlePowerUp(powerup.type, powerup.value)}
                            class="w-full border rounded p-2 flex items-center bg-zinc-800 hover:bg-zinc-700"
                        >
                            <span class="text-3xl mr-4"><Icon icon={powerup.icon} class={powerup.style} /></span>
                            <p class="flex flex-col">
                                <span>{powerup.title}</span>
                                <span class="text-sm">+{getBonus(powerup.value, _data.powerUps.history[powerup.type])}</span>
                            </p>
                        </button>
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
</div>
