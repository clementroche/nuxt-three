<template>
  <e-scroller @update="onUpdate">
    <slot />
  </e-scroller>
</template>

<script>
import viewportResize from '@/mixins/viewport-resize'
import useWebGL from '@/hooks/use-webgl'

export default {
  mixins: [viewportResize],

  methods: {
    onUpdate({ position, lerpedPosition, velocity, progress }) {
      this.$store.commit('scroll/setPosition', lerpedPosition)
      this.$store.commit('scroll/setProgress', progress)
      this.$store.commit('scroll/setVelocity', velocity)

      const { camera } = useWebGL()
      camera.position.y = -lerpedPosition.y
    },
    onViewportResize() {
      this.$store.commit(
        'scroll/setInitialPosition',
        this.$store.state.scroll.position
      )
    }
  }
}
</script>

<style lang="scss">
.e-scroller {
  height: calc(100 * var(--vh, 1vh));
  overflow: hidden;
}
</style>
