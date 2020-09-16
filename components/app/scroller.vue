<template>
  <e-scroller
    ref="scroller"
    @scroll="onScroll"
    :disabled="native"
    class="appScroller"
  >
    <slot />
  </e-scroller>
</template>

<script>
export default {
  computed: {
    native() {
      return this.$mq === 'mobile'
    },
    pageLoaded() {
      return this.$store.getters['loading/loaded']
    }
  },
  watch: {
    native() {
      this.$store.commit('scroll/reset')
    },
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

    this.onScroll({
      position: { x: window.scrollX, y: -window.scrollY }
    })

    window.addEventListener(
      'scroll',
      () => {
        this.onScroll({
          position: { x: window.scrollX, y: -window.scrollY }
        })
      },
      false
    )
  },
  methods: {
    onScroll({ position, progress, velocity }) {
      if (position) this.$store.commit('scroll/setPosition', position)
      if (progress) this.$store.commit('scroll/setProgress', progress)
      if (velocity) this.$store.commit('scroll/setVelocity', velocity)
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
