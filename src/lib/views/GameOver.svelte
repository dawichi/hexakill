<!--
    @component
    ## Game Over component
    This component is used to show the game over screen.
-->
<script lang="ts">
    import type { Character, Enemy } from '$lib/models'

    // components
    import Icon from '@iconify/svelte'
    import BgImage from '$lib/components/BgImage.svelte'
    import Tooltip from '$lib/components/Tooltip.svelte'
    // others
    import { gameData } from '$lib/data/data'
    import { tooltipsService } from '$lib/services'
    import { StatIcons } from '$lib/config/statIcons'
    import { styles } from '$lib/config/styles'
    import type { GameDTO } from '$lib/types/Game.dto'

    let _player: Character
    let _enemy: Enemy
    let _data: GameDTO

    gameData.subscribe(n => {
        if (!n.character || !n.enemy) return n
        _player = n.character
        _enemy = n.enemy
        _data = n
    })

    const colorHpBar = (hpWidth: number) => {
        if (hpWidth <= 10) return 'bg-red-600'
        if (hpWidth > 10 && hpWidth <= 40) return 'bg-yellow-600'
        return 'bg-green-600'
    }

    function counter(
        enemies: {
            image: string
            level: number
        }[],
    ) {
        const count: { [Key: string]: Array<number> } = {}
        enemies.forEach(enemy => (count[enemy.image] ? count[enemy.image].push(enemy.level) : (count[enemy.image] = [enemy.level])))
        return Object.keys(count).map(key => ({
            key,
            levels: count[key],
        }))
    }

    function retry() {
        gameData.update(n => {
            n.view = 'champSelect'
            n.username = ''
            n.characterIdx = -1
            n.character = null
            n.enemy = null
            n.logs = {
                player: [],
                enemy: [],
            }
            n.enemiesHistory = []
            return n
        })
    }
</script>

<div class="h-screen flex flex-col justify-center items-center grid lg:grid-cols-3">
    <!-- YOUR STATS -->
    <section class={styles.cell + 'text-center flex items-center justify-center animate__animated animate__fadeIn animate__slower animate__delay-2s'}>
        <div>
            <h2 class="text-xl p-2">{_player.name}</h2>
            <h3>lv {_player.level}</h3>
            <div class="relative w-full h-64">
                <BgImage image={`/images/${_player.image}/idle.gif`} />
            </div>

            <div class="w-full flex flex-col items-center mb-5">
                <p class="flex justify-center items-center">
                    0 / {_player.health} <i class="ra ra-hearts text-red-600" />
                </p>
                <div class="bg-zinc-600/75 rounded-xl w-4/5 h-3" />
            </div>
        </div>
        <div>
            {#each StatIcons as stat}
                <div class="relative">
                    <Tooltip title={stat.name} content={tooltipsService.getStatTooltip(stat.stat, _player)}>
                        <p class="flex items-center text-lg p-2">
                            <span class="text-3xl">
                                <Icon icon={stat.icon} class={stat.style} />
                            </span>
                            <span class="pl-2">{_player[stat.stat]}</span>
                        </p>
                    </Tooltip>
                </div>
            {/each}
        </div>
    </section>

    <!-- CENTER MESSAGE AND RETRY BUTTON -->
    <section class="flex flex-col items-center justify-around animate__animated animate__fadeIn animate__slower">
        <div class="mb-8 flex flex-col items-center">
            <h1 class="text-8xl text-red-600 font-mono text-center mb-8">GAME<br />OVER</h1>
            <button on:click={retry} class={styles.button.base + styles.button.red}> Try again? </button>
        </div>
        <!-- ENEMIES HISTORY -->
        <section class={styles.cell + 'flex flex-col animate__animated animate__fadeIn animate__slower  animate__delay-4s relative'}>
            <h2 class="text-xl tracking-wider">Enemies killed:</h2>
            <hr />
            <div class="flex flex-wrap">
                {#each counter(_data.enemiesHistory) as enemy}
                    <Tooltip title={enemy.key} content={[`${enemy.levels}`]}>
                        <div class="flex flex-col">
                            <div class="relative w-20 h-20">
                                <BgImage image={`/images/${enemy.key}/idle.gif`} />
                            </div>
                            <span>x{enemy.levels.length}</span>
                        </div>
                    </Tooltip>
                {/each}
            </div>
        </section>
    </section>

    <!-- YOUR MURDERER STATS -->
    <section class={styles.cell + 'text-center flex items-center justify-center animate__animated animate__fadeIn animate__slower animate__delay-2s'}>
        <div>
            {#each StatIcons as stat}
                <div class="relative">
                    <Tooltip title={stat.name} content={tooltipsService.getStatTooltip(stat.stat, _enemy)}>
                        <p class="flex items-center text-lg p-2">
                            <span class="text-3xl">
                                <Icon icon={stat.icon} class={stat.style} />
                            </span>
                            <span class="pl-2">{_enemy[stat.stat]}</span>
                        </p>
                    </Tooltip>
                </div>
            {/each}
        </div>
        <div>
            <h2 class="text-xl p-2">{_enemy?.name}</h2>
            <h3>lv {_enemy?.level}</h3>
            <div class="relative w-full h-64">
                <BgImage image={`/images/${_enemy.image}/idle.gif`} />
            </div>

            <div class="w-full flex flex-col items-center mb-5">
                <p class="flex justify-center items-center">
                    {_enemy.health - _enemy.dmgReceived} / {_enemy.health} <i class="ra ra-hearts text-red-600" />
                </p>
                <div class="bg-zinc-600/75 rounded-xl w-4/5 ">
                    <div
                        class={`${colorHpBar(((_enemy.health - _enemy.dmgReceived) / _enemy.health) * 100)} rounded-xl h-3 transition-all duration-500`}
                        style={`width: ${((_enemy.health - _enemy.dmgReceived) / _enemy.health) * 100}%`}
                    />
                </div>
            </div>
        </div>
    </section>
</div>
