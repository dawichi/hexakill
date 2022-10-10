<!--
    @component
    ## Game Over component
    This component is used to show the game over screen.
-->
<script lang="ts">
    import type { Character } from '$lib/models'
    import type { EnemyHistory } from '$lib/types/EnemyHistory.dto'

    import Icon from '@iconify/svelte'
    import { StatIcons } from '$lib/config/statIcons'
    import { styles } from '$lib/config/styles'
    import BgImage from '$lib/components/BgImage.svelte'
    import { enemiesHistory, gameData, logs } from '$lib/data/stores'

    let _entity: Character
    let _history: Array<EnemyHistory>

    gameData.subscribe(n => {
        if (n.character) _entity = n.character
    })

    enemiesHistory.subscribe(n => {
        _history = n
    })

    function Counter(enemies: Array<EnemyHistory>) {
        const count: { [Key: string]: Array<number> } = {}
        enemies.forEach(enemy => (count[enemy.image] ? count[enemy.image].push(enemy.level) : (count[enemy.image] = [enemy.level])))
        return Object.keys(count).map(key => ({
            key,
            levels: count[key],
        }))
    }

    function retry() {
        gameData.set({
            step: 'starting',
            username: '',
            characterIdx: -1,
            character: null,
            enemy: null,
        })
        logs.set({
            player: [],
            enemy: [],
        })
        enemiesHistory.set([])
    }
</script>

<div class="h-screen flex flex-col justify-center items-center grid lg:grid-cols-3">
    <!-- YOUR STATS -->
    <section class={styles.cell + 'text-center flex items-center justify-center animate__animated animate__fadeIn animate__slower animate__delay-2s'}>
        <div>
            <h2 class="text-xl p-2">{_entity?.name}</h2>
            <h3>lv {_entity?.level}</h3>
            <div class="relative w-full h-64">
                <BgImage image={`/images/${_entity.image}/idle.gif`} />
            </div>

            <div class="w-full flex flex-col items-center mb-5">
                <p class="flex justify-center items-center">
                    {_entity.health} <i class="ra ra-hearts text-red-600" />
                </p>
                <div class="bg-zinc-600/75 rounded-xl w-4/5 ">
                    <div class="bg-green-600 rounded-xl h-3 transition-all duration-500 w-full" />
                </div>
            </div>
        </div>
        <div>
            {#each StatIcons as icon}
                <p class="p-3 flex items-center text-lg p-1" title={icon.stat}>
                    <span class="text-3xl">
                        <Icon icon={icon.name} class={icon.style} />
                    </span>
                    <span class="pl-2">{_entity[icon.stat]}</span>
                </p>
            {/each}
        </div>
    </section>

    <!-- CENTER MESSAGE AND RETRY BUTTON -->
    <section class="animate__animated animate__fadeIn animate__slower">
        <h1 class="text-8xl text-red-600 font-mono text-center">GAME<br />OVER</h1>
        <button />
        <section class={styles.cell + 'flex justify-center items-center'}>
            <button on:click={retry} class={styles.button.base + styles.button.red}> Try again? </button>
        </section>
    </section>

    <!-- ENEMIES HISTORY -->
    <section class={styles.cell + 'flex flex-col animate__animated animate__fadeIn animate__slower  animate__delay-4s'}>
        <h2 class="text-xl tracking-wider">Enemies:</h2>
        <hr />
        <div class="flex flex-wrap">
            {#each Counter(_history) as enemy}
                <div class="flex flex-col">
                    <div class="relative w-20 h-20">
                        <BgImage image={`/images/${enemy.key}/idle.gif`} />
                    </div>
                    <span>x{enemy.levels.length}</span>
                </div>
            {/each}
        </div>
    </section>
</div>
