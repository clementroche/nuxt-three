<template>
  <div class="appIndex">
    <scroller
      ref="scroller"
      @scroll="onScroll"
      :draggable="true"
      :native="$viewport.width <= 769"
    >
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
  },

  methods: {
    onScroll({ position, progress, velocity }) {
      this.$store.commit('scroll/setPosition', position)
      this.$store.commit('scroll/setProgress', progress)
      this.$store.commit('scroll/setVelocity', velocity)
    }
  }
}
</script>

<style lang="scss">
.appIndex {
  @include media('>m') {
    cursor: grab;
    height: 100vh;
  }
}
</style>
