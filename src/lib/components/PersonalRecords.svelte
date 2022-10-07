<!--
  @component
  ## PersonalRecords
  Display a list of personal records (stored in localStorage)
-->
<script lang="ts">
    import type { PersonalRecord } from '$lib/types/PersonalRecord.dto'
    import { characters } from '$lib/config/characters'
    import { localStorageService } from '$lib/services/localStorage.service'

    let _personalRecords: PersonalRecord[] = localStorageService.get()
</script>

<div class="flex flex-col gap-2 p-2">
    <p class="flex justify-between">
        <span>Personal Record</span>
        {#if _personalRecords.length}
            <button
                title="Delete all records"
                on:click={() => {
                    localStorageService.clear()
                    _personalRecords = []
                }}
                class="bg-red-600 px-1 rounded"
            >
                <i class="bi bi-x" />
            </button>
        {/if}
    </p>
    <hr />

    {#each _personalRecords as pr}
        <p class={'rounded flex justify-between px-2 ' + characters[pr.classIdx].data.bg}>
            <span>{pr.name}</span>
            <span>lv {pr.record}</span>
        </p>
    {/each}
</div>
