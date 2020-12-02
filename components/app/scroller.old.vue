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
    }
  },
  watch: {
    native() {
      this.$refs.scroller.reset()
      this.$refs.scroller.onWindowResize()
      this.$store.commit('scroll/reset')
    }
  },

  mounted() {
    this.onWindowResize()
    this.$viewport.events.on('resize', this.onWindowResize)

    this.$events.on('router:change', this.$refs.scroller.reset)
    this.$events.on('router:mounted', this.$refs.scroller.onWindowResize)
    this.$events.on('scroll:to', this.onScrollTo)

    if (this.native) {
      this.onScroll({
        position: { x: window.scrollX, y: window.scrollY }
      })
    }

    window.addEventListener(
      'scroll',
      () => {
        this.onScroll({
          position: { x: window.scrollX, y: window.scrollY }
        })
      },
      false
    )
  },
  methods: {
    onScrollTo({ x, y }) {
      this.$refs.scroller.scroller.scrollTo({ x, y }, 2)
    },
    onScroll({ position, progress, velocity }) {
      if (position) this.$store.commit('scroll/setPosition', position)
      if (progress) this.$store.commit('scroll/setProgress', progress)
      if (velocity) this.$store.commit('scroll/setVelocity', velocity)
    },
    onWindowResize() {
      this.$store.commit(
        'scroll/setInitialPosition',
        this.$store.state.scroll.position
      )
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
