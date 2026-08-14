<!--
    @component
    ## PowerUps
    Display the power ups available to the player.
-->
<script lang="ts">
    import Icon from '@iconify/svelte'
    import { gameData } from '$lib/data/data'
    import { getPowerupProp, powerups } from '$lib/config/powerups'

    // Values binded to global store

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
        if (!$gameData.character) return
        $gameData.powerUps.pending -= 1
        if (!$gameData.powerUps.history[type]) {
            $gameData.powerUps.history[type] = 0
        }
        $gameData.character[type] += getBonus(value, $gameData.powerUps.history[type])
        $gameData.powerUps.history[type] += 1
        gameData.update(d => d)
    }

    function safe(type: 'health' | 'ad' | 'ap' | 'speed', value: number) {
        if (($gameData.powerUps.history[type] ?? 0) < 6) handlePowerUp(type, value)
    }
    function onKeyDown(event: KeyboardEvent): void {
        if (!$gameData.powerUps.pending) return
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

<div class="text-center">
    <div class="grid grid-cols-4 gap-3 p-4">
        {#each Object.keys($gameData.powerUps.history) as powerupKey}
            <div class="flex flex-col items-start rounded bg-zinc-700 p-1">
                <div class="flex items-center">
                    <span class="mr-4 text-3xl">
                        <Icon icon={getPowerupProp(powerupKey, 'icon')} class={getPowerupProp(powerupKey, 'style')} />
                    </span>
                    {#each [...Array($gameData.powerUps.history[powerupKey]).keys()] as _}
                        <span class="text-yellow-400"><Icon icon="ant-design:star-filled" /></span>
                    {/each}
                </div>
                <span>{'+' + getAccBonus(powerupKey, $gameData.powerUps.history[powerupKey])}</span>
            </div>
        {/each}
    </div>
    {#if $gameData.powerUps.pending}
        <h3 class="text-xl">Choose an upgrade!</h3>
        <h4>Pending: {$gameData.powerUps.pending}</h4>
        <hr class="m-2" />
        <div class="grid gap-4 p-2 lg:grid-cols-3">
            {#each powerups as powerup}
                {#if !$gameData.powerUps.history[powerup.type] || $gameData.powerUps.history[powerup.type] < 6}
                    <div>
                        <button
                            on:click={() => handlePowerUp(powerup.type, powerup.value)}
                            class="flex w-full items-center rounded border bg-zinc-800 p-2 hover:bg-zinc-700"
                        >
                            <span class="mr-4 text-3xl"><Icon icon={powerup.icon} class={powerup.style} /></span>
                            <p class="flex flex-col">
                                <span>{powerup.title}</span>
                                <span class="text-sm">+{getBonus(powerup.value, $gameData.powerUps.history[powerup.type])}</span>
                            </p>
                        </button>
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
</div>
