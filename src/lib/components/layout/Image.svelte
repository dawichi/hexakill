<!--
  @component
  ## Image
  Display an image using `background-image` instead of `<img/>`
  @param image - the URL to the image
-->
<script lang="ts">
    export let image: string
</script>

<div class="bgimage" style='background-image: url({image});'/>

<style>
    .bgimage {
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        height: 100%;
        width: 100%;
    }
</style>
