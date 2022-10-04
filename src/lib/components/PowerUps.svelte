<!--
  @component
  ## BgImage
  Display an image using `background-image` instead of `<img/>`
-->
<script lang="ts">
    import type { Character } from '$lib/models'

    import Icon from '@iconify/svelte'
    import { gameData } from '$lib/data/stores'
    import { getPowerupProp, powerups } from '$lib/config/powerups'

    export let _powerUps: {
        pending: number
        history: { [key: string]: number }
    }

    // Values binded to global store
    let _player: Character | null

    // Bind values
    gameData.subscribe(n => {
        _player = n.character
    })

    function handlePowerUp(type: 'health' | 'ad' | 'ap' | 'speed', value: number): void {
        _powerUps.pending -= 1
        _powerUps.history[type] ? (_powerUps.history[type] += 1) : (_powerUps.history[type] = 1)
        if (!_player) return
        _player[type] += value
        gameData.update(n => n)
    }

    function calcTotalPowerupValue(value: number | string, quantity: number): number {
        if (typeof value === 'string') value = parseInt(value)
        return value * quantity
    }
</script>

<div>
    <div class="grid grid-cols-4 gap-3 p-4">
        {#each Object.keys(_powerUps.history) as powerupKey}
            <div class="flex flex-col items-start p-1 rounded bg-zinc-700">
                <div class="flex items-center">
                    <span class="text-3xl mr-4">
                        <Icon icon={getPowerupProp(powerupKey, 'icon')} class={getPowerupProp(powerupKey, 'style')} />
                    </span>
                    {#each [...Array(_powerUps.history[powerupKey]).keys()] as _}
                        <span class="text-yellow-400"><Icon icon="ant-design:star-filled" /></span>
                    {/each}
                </div>
                <span>{'+' + calcTotalPowerupValue(getPowerupProp(powerupKey, 'value'), _powerUps.history[powerupKey])}</span>
            </div>
        {/each}
    </div>
    {#if _powerUps.pending}
        <h3 class="text-xl">Choose an upgrade!</h3>
        <h4>Pending: {_powerUps.pending}</h4>
        <hr class="m-2" />
        <div class="grid lg:grid-cols-3 gap-4 p-2">
            {#each powerups as powerup}
                {#if !_powerUps.history[powerup.type] || _powerUps.history[powerup.type] < 6}
                <div>
                    <button
                        on:click={() => handlePowerUp(powerup.type, powerup.value)}
                        class="w-full border rounded p-2 flex items-center bg-zinc-800 hover:bg-zinc-700"
                    >
                        <span class="text-3xl mr-4"><Icon icon={powerup.icon} class={powerup.style} /></span>
                        <p class="flex flex-col">
                            <span>{powerup.title}</span>
                            <span class="text-sm">+{powerup.value}</span>
                        </p>
                    </button>
                </div>
                {/if}
            {/each}
        </div>
    {/if}
</div>
