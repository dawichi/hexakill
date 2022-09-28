<!--
  @component
  ## BgImage
  Display an image using `background-image` instead of `<img/>`
  @param image - the URL to the image
-->

<script lang="ts">
    export let image: string
    const style = 'background-image: url(' + image + ');'
</script>

<div class="bgimage" style={style} />

<style>
.bgimage {
    background-size: cover;
    background-position: center;
    height: 100%;
    width: 100%;
}
</style>