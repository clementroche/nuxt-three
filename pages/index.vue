<template>
  <div class="appIndex">
    <scroller :draggable="true" :native="$viewport.width <= 769">
      <app-title />
      <images-grid class="appIndex__imagesGrid" />
    </scroller>
  </div>
</template>

<script>
import useWebGL from '@/hooks/use-webgl'

export default {
  components: {
    AppTitle: () => import('@/components/blocks/app-title'),
    ImagesGrid: () => import('@/components/blocks/images-grid')
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
