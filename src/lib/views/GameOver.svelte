<!--
    @component
    ## Game Over component
    This component is used to show the game over screen.
-->
<script lang="ts">
    import { Image, Tooltip } from '$lib/components'
    import { gameData } from '$lib/data/data'
    import { styles } from '$lib/config/styles'
    import Entity from '$lib/components/Entity.svelte'
    import { Button } from 'flowbite-svelte'
    import { items } from '$lib/config/items'
    import { ItemModel } from '$lib/models'

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
            n.character = null
            n.enemy = null
            n.showUI = {
                fighting: false,
                actionBtns: true,
            }
            n.logs = {
                player: [],
                enemy: [],
            }
            n.powerUps = {
                pending: 0,
                history: {},
            }
            n.enemiesHistory = []
            n.shop.items = items.map(item => new ItemModel(item.name, item.price, item.bonus))
            return n
        })
    }

    function onKeyDown(event: KeyboardEvent): void {
        if (event.code === 'Space') retry()
        return
    }
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<div class="flex grid h-screen flex-col items-center justify-center lg:grid-cols-3">
    <!-- YOUR STATS -->
    <section class="entity animate__animated animate__fadeIn animate__slower animate__delay-2s mx-auto">
        <Entity type="character" />
    </section>

    <!-- CENTER MESSAGE AND RETRY BUTTON -->
    <section class="animate__animated animate__fadeIn animate__slower flex flex-col items-center justify-around">
        <div class="mb-8 flex flex-col items-center">
            <h1 class="mb-8 text-center font-mono text-8xl text-red-600">GAME<br />OVER</h1>
            <Button gradient color="red" on:click={retry}>
                <span class="text-xl font-bold tracking-wider">Try again?</span>
            </Button>
        </div>
        <!-- ENEMIES HISTORY -->
        <section class={styles.cell + 'flex flex-col animate__animated animate__fadeIn animate__slower  animate__delay-4s relative'}>
            <h2 class="text-xl tracking-wider">Enemies killed:</h2>
            <hr />
            <div class="flex flex-wrap">
                {#each counter($gameData.enemiesHistory) as enemy}
                    <Tooltip
                        data={{
                            title: enemy.key,
                            bonus: null,
                            content: [String(enemy.levels)],
                        }}
                    >
                        <div class="flex flex-col">
                            <div class="relative h-20 w-20">
                                <Image image={`/images/${enemy.key}/idle.gif`} />
                            </div>
                            <span>x{enemy.levels.length}</span>
                        </div>
                    </Tooltip>
                {/each}
            </div>
        </section>
    </section>

    <!-- ENEMY STATS -->
    <section class="entity animate__animated animate__fadeIn animate__slower animate__delay-2s mx-auto">
        <Entity type="enemy" />
    </section>
</div>

<style>
    .entity {
        width: 450px;
    }
</style>
