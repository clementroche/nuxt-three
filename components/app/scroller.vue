<template>
  <e-scroller
    ref="scroller"
    @scroll="onScroll"
    :disabled="$mq === 'mobile'"
    :draggable="$mq === 'desktop'"
    :scrollable="$mq === 'desktop'"
    class="appScroller"
  >
    <slot />
  </e-scroller>
</template>

<script>
export default {
  computed: {
    pageLoaded() {
      return this.$store.getters['loading/loaded']
    }
  },
  watch: {
    pageLoaded() {
      if (this.pageLoaded) {
        setTimeout(() => {
          this.$events.emit('viewport:resize')
          this.$refs.scroller.onWindowResize()
        }, 0)
      }
    }
  },

  mounted() {
    this.$events.on('router:change', this.$refs.scroller.reset)
    this.$events.on('router:mounted', this.$refs.scroller.onWindowResize)
    this.$events.on('swiper:init', this.$refs.scroller.onWindowResize)
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
.appScroller {
  @include media('>m') {
    height: 100vh !important;
    height: calc(var(--vh, 1vh) * 100) !important;
  }
}
</style>
