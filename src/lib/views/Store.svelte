<script lang="ts">
    import { styles } from '$lib/config/styles'
    import { gameData } from '$lib/data/data'

    function closeStore(): void {
        gameData.update(n => {
            n.view = 'combat'
            return n
        })
    }
</script>

<section>
    <button on:click={closeStore} class={styles.button.base + styles.button.red}> Arena </button>
</section>
