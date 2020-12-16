<template>
  <div
    :class="{ 'e-scroller--horizontal': direction === 'horizontal' }"
    class="e-scroller"
  >
    <div
      ref="inner"
      :style="{
        transform: transform
      }"
      class="e-scroller__inner"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import ResizeObserver from 'resize-observer-polyfill'
import gsap from '@/libs/gsap-bonus'
import VelocityTracker from '@/libs/gsap-bonus/utils/VelocityTracker'
import useVirtualScroll from '@/hooks/use-virtual-scroll'
import frame from '@/mixins/frame'
import boundingRect from '@/mixins/bounding-rect'

export default {
  mixins: [frame, boundingRect],

  props: {
    direction: { type: String, default: 'vertical' }
  },

  data() {
    return {
      position: { x: 0, y: 0 },
      lerpedPosition: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      maxScroll: { x: 0, y: 0 },
      transform: 'translate3d(0px,0px,0px)'
    }
  },

  computed: {
    progress() {
      return {
        x: this.lerpedPosition.x / this.maxScroll.x,
        y: this.lerpedPosition.y / this.maxScroll.y
      }
    }
  },
  mounted() {
    this.resizeObserver = new ResizeObserver((entries) => {
      const contentRect = entries[0].contentRect

      this.maxScroll = {
        x: contentRect.width - this.boundingRect.width,
        y: contentRect.height - this.boundingRect.height
      }
    })

    this.resizeObserver.observe(this.$refs.inner)

    const virtualScroll = useVirtualScroll()
    virtualScroll.on(this.onVirtualScroll)

    this.velocityTracker = VelocityTracker.track(this.lerpedPosition, 'x,y')[0]
  },

  beforeDestroy() {
    this.resizeObserver.unobserve(this.$refs.inner)

    const virtualScroll = useVirtualScroll()
    virtualScroll.off(this.onVirtualScroll)
  },

  methods: {
    dispatch() {
      this.$emit('update', {
        position: { ...this.position },
        lerpedPosition: { ...this.lerpedPosition },
        velocity: { ...this.velocity },
        progress: { ...this.progress }
      })
    },
    onBeforeFrame(e) {
      if (this.velocityTracker) {
        this.velocity.x = this.velocityTracker.get('x')
        this.velocity.y = this.velocityTracker.get('y')
      }

      this.dispatch()
    },
    onAfterRender() {
      this.transform = `translate3d(${this.lerpedPosition.x}px,${-this
        .lerpedPosition.y}px,0)`
    },
    scrollTo({ x, y, props = { duration: 1, ease: 'expo.out' } }) {
      this.tween?.kill()
      this.tween = gsap.to(this.lerpedPosition, {
        ...props,
        x: x === undefined ? this.lerpedPosition.x : x,
        y: y === undefined ? this.lerpedPosition.y : y
      })
    },
    onVirtualScroll({ deltaX, deltaY }) {
      this.position.y = gsap.utils.clamp(
        0,
        this.maxScroll.y,
        this.position.y - deltaY
      )

      this.position.x = gsap.utils.clamp(
        0,
        this.maxScroll.x,
        this.position.x - deltaY
      )

      this.scrollTo({ ...this.position })
    },
    reset() {
      this.position = { x: 0, y: 0 }
      this.lerpedPosition = { x: 0, y: 0 }
    }
  }
}
</script>

<style lang="scss">
.e-scroller {
  &__inner {
    min-height: 100%;
    min-width: 100%;
  }

  &--horizontal {
    .e-scroller__inner {
      display: inline-flex;
      height: 100%;
    }
  }
}
</style>
