<!--
  @component
  ## Container
  Display the content in a centered container
-->
<div class="container mx-auto">
    <div class="bg-zinc-900 lg:h-screen pt-20 pb-10 relative">
        <h1 class="absolute top-0 text-3xl p-5 text-center w-full tracking-widest">HEXAKILL</h1>
        <!-- <nav class='absolute top-0 right-10 text-white'>
            <MusicToggle color={colorTheme} />
        </nav> -->
        <slot />
    </div>
</div>
