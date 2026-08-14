<!--
  @component
  ## Modal
-->
<script lang="ts">
    import { modalContext } from "$lib/data/modal"

    export let title = ""

    const modal = {
        // Element.showModal() is still not noted in TS lib definitions
        open: () => {
            if (!document?.querySelector('[data-modal]')) return
            ;(document?.querySelector('[data-modal]') as any).showModal()
        },
        close: () => {
            if (!document?.querySelector('[data-modal]')) return
            ;(document?.querySelector('[data-modal]') as any).close()
        },
    }

    // This memo the state to prevent multiple calls
    let isModalOpen = false
    $: modalContext.subscribe(val => {
        // Skip re-render if the value is the same
        if (isModalOpen === val) return

        // Update the memo and run the logic
        isModalOpen = val
        val ? modal.open() : modal.close()
    })
</script>

<dialog data-modal class="relative rounded bg-zinc-900 p-8 text-white shadow-lg shadow-zinc-700">
    <div class="flex justify-between">
        <h3 class="text-xl font-bold">{title}</h3>
        <button class="h-6 w-6 border border-zinc-500 bg-zinc-700 text-white hover:border-red-500 hover:bg-red-500" on:click={() => modalContext.set(false)}>
            <i class="bi bi-x-lg" />
        </button>
    </div>

    <hr class="my-4" />

    <slot />
</dialog>

<style>
    dialog::backdrop {
        background-color: rgba(12, 12, 12, 0.5);
        /* From https://css.glass */
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(8.7px);
        -webkit-backdrop-filter: blur(8.7px);
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
</style>
