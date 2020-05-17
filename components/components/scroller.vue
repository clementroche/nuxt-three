<template>
  <div :class="{ 'scroller--native': native }" class="scroller">
    <div
      ref="inner"
      :style="{
        transform: `translate(${scrollPosition.x}px,${scrollPosition.y}px)`
      }"
      class="scroller__inner"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Scroller from '@/assets/js/scroller'
import Dragger from '@/assets/js/dragger'

export default {
  name: 'Scroller',
  props: {
    scrollable: {
      type: Boolean,
      default: true
    },
    draggable: {
      type: Boolean,
      default: false
    },
    native: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      initialScroll: 0
    }
  },
  computed: {
    ...mapState({
      scrollPosition: (state) => state.scroll.position
    })
  },
  watch: {
    scrollable() {
      this.scroller.enabled = this.native ? false : this.scrollable
    },
    draggable() {
      this.dragger.enabled = this.native ? false : this.draggable
    },
    native() {
      if (this.native) {
        this.scroller.enabled = false
        this.scroller.enabled = false
      } else {
        this.scroller.enabled = this.scrollable
        this.dragger.enabled = this.draggable
      }
    }
  },
  mounted() {
    this.scroller = new Scroller(this.$refs.inner)
    this.scroller.events.on('scroll', this.onScroll)
    this.scroller.enabled = this.native ? false : this.scrollable

    this.dragger = new Dragger(this.$el)
    this.dragger.events.on('drag:move', this.onDrag)
    this.dragger.enabled = this.native ? false : this.draggable

    this.$viewport.events.on('resize', this.onWindowResize)
  },
  beforeDestroy() {
    if (this.scroller) {
      this.scroller.destroy()
      this.scroller.events.off('scroll', this.onScroll)
    }

    if (this.dragger) {
      this.dragger.destroy()
      this.dragger.events.off('drag:move', this.onDrag)
    }

    this.$viewport.events.off('resize', this.onWindowResize)
  },
  methods: {
    onWindowResize() {
      if (this.scroller) {
        this.scroller.resize()
      }
    },
    onScroll({ position, progress, velocity }) {
      this.$store.commit('scroll/setPosition', position)
      this.$store.commit('scroll/setProgress', progress)
      this.$store.commit('scroll/setVelocity', velocity)
    },
    onDrag({ deltaX, deltaY }) {
      this.scroller.onScroll({ deltaX: -deltaX, deltaY: -deltaY })
    }
  }
}
</script>

<style lang="scss">
.scroller {
  height: 100vh;
  height: calc(100 * var(--vh, 1vh));
  overflow: hidden;
  width: 100vw;

  &--native {
    overflow: auto;
  }
}
</style>
