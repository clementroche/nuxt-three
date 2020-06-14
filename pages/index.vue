<template>
  <div class="appIndex">
    <scroller ref="scroller" :draggable="true" :native="$viewport.width <= 769">
      <app-title />
      <images-grid ref="image-grid" class="appIndex__imagesGrid" />
    </scroller>
  </div>
</template>

<script>
import useWebGL from '@/hooks/use-webgl'

import AppTitle from '@/components/blocks/app-title'
import ImagesGrid from '@/components/blocks/images-grid'

export default {
  components: {
    AppTitle,
    ImagesGrid
  },

  mounted() {
    const { composer } = useWebGL()
    const { barrelEffect } = composer

    barrelEffect.uniforms.get('intensity').value = -0.1
  }
}
</script>

<style lang="scss">
.appIndex {
  cursor: grab;

  &__imagesGrid {
    padding-top: 90vh;
  }
}
</style>
