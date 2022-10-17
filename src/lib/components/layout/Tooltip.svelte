<!--
    @component
    ## Tooltip
    Display a tooltip when hovering over an element
    @param data - the data to display in the tooltip
    @param content - the content to display in the tooltip, array of strings (only used in normal tooltip)
    @param type - type of tooltip: normal | item
    @param styleLeftPx - left position of the tooltip
    @param bonus - bonus to display in the tooltip (only used in item tooltip)

-->
<script lang="ts">
    import { getPowerupProp } from '$lib/config/powerups'
    import Icon from '@iconify/svelte'


    type TooltipNormal = {
        title: string
        content: string[]
    }

    type TooltipItem = {
        title: string
        bonus: [string, number][]
    }

    export let data: TooltipNormal | TooltipItem
    export let styleLeftPx: number = 80

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

<div class="relative">
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <div on:mouseover={mouseOver} on:mouseleave={mouseLeave} on:mousemove={mouseMove}>
        <slot />
    </div>

    {#if isHovered}
        <div class="tooltip rounded border bg-zinc-900 p-2 text-left shadow shadow-lg shadow-zinc-700" style={`left: ${styleLeftPx}px`}>
            <p>{data.title}</p>
            <!-- Normal tooltip -->
            {#if 'content' in data}
                {#each data.content as p}
                    <p class="pl-4">{p}</p>
                {/each}
            {/if}

            <!-- Item tooltip -->
            {#if 'bonus' in data}
                {#each data.bonus as bonus}
                    <p class="flex items-center pl-4 text-lg">
                        <Icon icon={getPowerupProp(bonus[0], 'icon')} class={getPowerupProp(bonus[0], 'style')} />
                        <span class="pl-2">+{bonus[1]}</span>
                    </p>
                {/each}
            {/if}
        </div>
    {/if}
</div>

<style>
    .tooltip {
        top: 0px;
        position: absolute;
        white-space: nowrap;
        z-index: 999;
    }
</style>
