<!--
  @component
  ## PersonalRecords
  Display a list of personal records (stored in localStorage)
  @param image - the URL to the image
-->
<script lang="ts">
    import type { PersonalRecord } from "$lib/types/PersonalRecord"
    import { getCharacterStyle } from '$lib/config/characters'

    const key = 'hxkllPersonalRecords'
    let _personalRecords: PersonalRecord[] = get()

    /**
     * Get the personal records from localStorage
     */
    function get(): PersonalRecord[] {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : []
    }

    /**
     * Add a new personal record to localStorage
     */
    function add(record: PersonalRecord) {
        const data = localStorage.getItem(key)
        const data_arr = data ? JSON.parse(data) : []
        data_arr.push(record)
        data_arr.sort((a: PersonalRecord, b: PersonalRecord) => b.record - a.record)
        localStorage.setItem(key, JSON.stringify(data_arr.slice(0, 5)))
    }

    /**
     * Clear the personal records from localStorage
     */
    function clear() {
        localStorage.removeItem(key)
    }
</script>


<div class="flex flex-col gap-2 p-2">
    <p class="flex justify-between">
        <span>Personal Record</span>
        {#if _personalRecords.length}
            <button
                title="Delete all records"
                on:click={() => {
                    clear()
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
        <p class={'rounded flex justify-between px-2 ' + getCharacterStyle(pr.class)}>
            <span>{pr.name}</span>
            <span>lv {pr.record}</span>
        </p>
    {/each}
</div>