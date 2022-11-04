<!--
  @component
  ## Timers
  Display one of the different modalities of the timers
-->
<script lang="ts">
    const timer = {
        seconds: 0,
        text: '',
        increment: (): void => {
            timer.seconds += 1
            if (timer.seconds >= 60 * 60) {
                timer.text = `${Math.floor(timer.seconds / 60 / 60)}h ${Math.floor(timer.seconds / 60) % 60}m ${timer.seconds % 60}s`
            } else if (timer.seconds >= 60) {
                timer.text = `${Math.floor(timer.seconds / 60)}m ${timer.seconds % 60}s`
            } else {
                timer.text = `${timer.seconds}s`
            }
        },
    }

    setInterval(timer.increment, 1000)
</script>

<span>
    {timer.text}
</span>
