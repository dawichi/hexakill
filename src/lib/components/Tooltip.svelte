<!--
    @component
    ## Tooltip
    Display a tooltip when hovering over an element
    @param title - the title to display in the tooltip
    @param content - the content to display in the tooltip, array of strings
-->
<script lang="ts">
    export let title: string
    export let content: string[] = []

    let isHovered = false
    let x = 0
    let y = 0

    function mouseOver(event: MouseEvent) {
        isHovered = true
        x = event.pageX + 5
        y = event.pageY + 5
    }
    function mouseMove(event: MouseEvent) {
        x = event.pageX + 5
        y = event.pageY + 5
    }
    function mouseLeave() {
        isHovered = false
    }
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div on:mouseover={mouseOver} on:mouseleave={mouseLeave} on:mousemove={mouseMove}>
    <slot />
</div>

{#if isHovered}
    <div class="tooltip border rounded shadow bg-zinc-900 p-2 text-left shadow-lg shadow-zinc-700">
        <p>{title}</p>
        {#each content as p}
            <p class="pl-4">{p}</p>
        {/each}
    </div>
{/if}

<style>
    .tooltip {
        top: 0px;
        left: 80px;
        position: absolute;
        white-space: nowrap;
    }
</style>
