<script lang="ts">
    export let onClick: () => void
</script>

<button on:click={onClick} class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded">
    <slot />
</button>
