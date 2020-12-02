<template>
  <div :class="{ 'scroller--disabled': disabled }" class="scroller">
    <div
      ref="inner"
      :style="
        scrollable || draggable
          ? {
              transform: `translate3d(${
                scrollPosition.x
              }px, ${-scrollPosition.y}px, 0px)`
            }
          : {}
      "
      class="scroller__inner"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import Scroller from '@/assets/js/scroller'
import Dragger from '@/assets/js/dragger'
import useVirtualScroll from '@/hooks/use-virtual-scroll'

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
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scrollPosition: { x: 0, y: 0 }
    }
  },
  watch: {
    disabled() {
      this.scroller.disabled = this.disabled
    }
  },
  mounted() {
    this.scroller = new Scroller(this.$refs.inner)
    this.scroller.events.on('scroll', this.onScroll)
    this.scroller.disabled = this.disabled

    const virtualScroll = useVirtualScroll()
    virtualScroll.on(this.onVirtualScroll)

    this.dragger = new Dragger(this.$el)
    this.dragger.events.on('drag:move', this.onDrag)

    this.$viewport.events.on('resize', this.onWindowResize)
  },
  beforeDestroy() {
    this.scroller.destroy()
    this.scroller.events.off('scroll', this.onScroll)

    this.dragger.destroy()
    this.dragger.events.off('drag:move', this.onDrag)

    this.$viewport.events.off('resize', this.onWindowResize)
  },
  methods: {
    reset() {
      if (this.scroller) {
        this.scroller.reset()
        // this.scroller.resize()
      }
    },
    onWindowResize() {
      if (this.scroller) {
        this.scroller.resize()
      }
    },
    onVirtualScroll({ deltaX, deltaY }) {
      if (!this.scrollable) return
      this.scroller.onScroll({ deltaX, deltaY })
    },
    onScroll({ position, progress, velocity }) {
      position = { x: position.x, y: -position.y }
      this.$emit('scroll', { position, progress, velocity })
      this.scrollPosition = position
    },
    onDrag({ deltaX, deltaY }) {
      if (!this.draggable) return
      this.scroller.onScroll({ deltaX: -deltaX, deltaY: -deltaY })
    }
  }
}
</script>

<style lang="scss">
.scroller {
  height: 100%;
  overflow: hidden;

  // &__inner {
  //   will-change: transform;
  // }

  // &--disabled {
  //   height: auto;
  //   overflow: auto;
  // }
}
</style>
