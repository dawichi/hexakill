<!--
  @component
  ## Logger
  Diplays the log messages
-->
<script lang="ts">
    import { logs } from '$lib/data/data'
    import { styles } from '$lib/config/styles'
    import type { LoggerDTO } from '$lib/types/Logger.dto'

    let _logs: LoggerDTO = {
        player: [],
        enemy: [],
    }

    logs.subscribe(n => {
        _logs = n
    })
</script>

<div class={styles.cell}>
    <h4 class="text-center text-lg p-2">Info</h4>
    <hr />
    <article class="p-4 h-4/5 overflow-y-hidden grid grid-cols-2 gap-4">
        <div>
            {#each _logs.player as log, idx}
                <div class="animate__animated animate__fadeIn mt-2">
                    <p class={idx < _logs.player.length - 4 ? 'opacity-25' : ''}>
                        <span class="text-green-400">{log.title}</span>
                        {log.message}
                        {#if log.value !== undefined}
                            did <span class="text-red-400">{log.value}</span> damage! {log.icon}
                        {/if}
                    </p>
                </div>
            {/each}
        </div>
        <div>
            {#each _logs.enemy as log, idx}
                <div class="animate__animated animate__fadeIn mt-2">
                    <p class={idx < _logs.enemy.length - 4 ? 'opacity-25' : ''}>
                        <span class="text-red-400">{log.title}</span>
                        {log.message}
                        {#if log.value !== undefined}
                            did <span class="text-blue-400">{log.value}</span> damage! {log.icon}
                        {/if}
                    </p>
                </div>
            {/each}
        </div>
    </article>
</div>
