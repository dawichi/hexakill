<!--
  @component
  ## Container
  Display the content in a centered container
-->
<div class="container mx-auto">
    <div class="relative bg-zinc-900 pt-20 pb-10 lg:h-screen">
        <h1 class="absolute top-0 w-full p-5 text-center text-3xl tracking-widest">HEXAKILL</h1>
        <!-- <nav class='absolute top-0 right-10 text-white'>
            <MusicToggle color={colorTheme} />
        </nav> -->
        <slot />
    </div>
</div>
