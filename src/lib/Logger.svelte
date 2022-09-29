<!--
  @component
  ## Logger
  Diplays the log messages
-->
<script lang="ts">
    import { logs } from './data/stores'
    import type { LoggerDTO } from './types/Logger'

    let _logs: LoggerDTO = {
        player: [],
        enemy: [],
    }

    logs.subscribe(n => {
        _logs = n
    })
</script>

<article class="p-4 h-4/5 overflow-y-hidden grid grid-cols-2 gap-4">
    <div>
        {#each _logs.player as log, idx}
            <div class="animate__animated animate__fadeIn mt-2">
                <p class={idx > 2 ? 'opacity-25' : ''}>
                    <span class="text-green-400">{log.title}</span>
                    {#if 'message' in log}
                        {log.message}
                    {/if}
                </p>
            </div>
        {/each}
    </div>
    <div>
        {#each _logs.enemy as log, idx}
            <div class="animate__animated animate__fadeIn mt-2">
                <p class={idx > 2 ? 'opacity-25' : ''}>
                    <span class="text-red-400">{log.title}</span>
                    {#if 'message' in log}
                        {log.message}
                    {/if}
                </p>
            </div>
        {/each}
    </div>
</article>
