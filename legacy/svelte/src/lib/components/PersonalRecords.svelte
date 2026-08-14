<!--
  @component
  ## PersonalRecords
  Display a list of personal records (stored in localStorage)
-->
<script lang="ts">
    import type { PersonalRecord } from '$lib/types/PersonalRecord.dto'
    import { characters } from '$lib/config/characters'
    import { storageService } from '$lib/services'

    let _personalRecords: PersonalRecord[] = storageService.get()
    console.log(_personalRecords)
</script>

<div class="flex flex-col gap-2 rounded bg-zinc-800 p-4">
    <p class="mb-2 flex justify-between">
        <span>Personal Records</span>
        {#if _personalRecords.length}
            <button
                title="Delete all records"
                on:click={() => {
                    storageService.clear()
                    _personalRecords = []
                }}
                class="rounded bg-red-600 px-1"
            >
                <i class="bi bi-x" />
            </button>
        {/if}
    </p>

    {#if _personalRecords.length}
        {#each _personalRecords as pr}
            <p class={'rounded flex justify-between px-2 ' + characters[pr.classIdx].data.bg}>
                <span>{pr.name}</span>
                <span>lv {pr.record}</span>
            </p>
        {/each}
    {:else}
        <p class="text-center">No records yet :c</p>
    {/if}
</div>
