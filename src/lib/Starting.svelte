<!--
    @component
    ## Starting component
    This component is used to enter the name of the player and select his character.
-->
<script lang="ts">
    import { playing } from '$lib/data/stores'
    import { styles } from './config/styles'

    function startPlaying() {
        playing.set(true)
    }
</script>