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
      scrollPosition: new THREE.Vector2(0, 0)
    }
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
        this.dragger.enabled = false
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
      this.$emit('scroll', { position, progress, velocity })
      this.scrollPosition.copy(position)
    },
    onDrag({ deltaX, deltaY }) {
      this.scroller.onScroll({ deltaX: -deltaX, deltaY: -deltaY })
    }
  }
}
</script>

<style lang="scss">
.scroller {
  height: 100%;
  overflow: hidden;

  &__inner {
    will-change: transform;
  }

  &--native {
    height: auto;
    overflow: auto;
  }
}
</style>
