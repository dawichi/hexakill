<script lang="ts">
    export let onClick: () => void
    export let style = ''
    export let color: 'blue' | 'red' | 'amber' = 'blue'

    const colors = {
        blue: 'bg-indigo-600 hover:bg-indigo-700',
        red: 'bg-red-600 hover:bg-red-700',
        amber: 'bg-amber-600 hover:bg-amber-700',
    }
</script>

<button on:click={onClick} class="{colors[color]} px-6 py-2 rounded {style}">
    <slot />
</button>
