import Events from 'events'
import gsap from 'gsap'
import { Vector2 } from 'three'
import Vue from 'vue'
import Viewport from '@/plugins/viewport'

/* eslint nuxt/no-globals-in-created:0 */

const mouse = new Vue({
  data() {
    return {
      lerpedPosition: new Vector2(-1000, -1000),
      position: new Vector2(-1000, -1000),
      velocity: new Vector2(0, 0)
    }
  },
  computed: {
    normalized() {
      return new Vector2(
        (this.position.x / Viewport.width) * 2 - 1,
        -(this.position.y / Viewport.height) * 2 + 1
      )
    },
    lerpedNormalized() {
      return new Vector2(
        (this.lerpedPosition.x / Viewport.width) * 2 - 1,
        -(this.lerpedPosition.y / Viewport.height) * 2 + 1
      )
    },
    computed() {
      return {
        normalized: this.normalized
      }
    }
  },
  created() {
    this.events = new Events()
    window.addEventListener('touchstart', this.onMouseMove.bind(this), false)
    window.addEventListener('touchmove', this.onMouseMove.bind(this), false)
    window.addEventListener('mousemove', this.onMouseMove.bind(this), false)
  },
  methods: {
    // loop() {

    //   if (!this.velocity.needsUpdate) {
    //     this.velocity.set(0, 0)
    //   }
    //   this.velocity.needsUpdate = false

    //   this.velocity.lerp(this.velocity, this.velocity.length() ? 0.5 : 0.1)
    // },
    onMouseMove(e) {
      const originalEvent = e

      if (e.changedTouches && e.changedTouches.length) {
        e.x = e.changedTouches[0].pageX
        e.y = e.changedTouches[0].pageY
      }

      if (e.x === undefined) {
        e.x = e.pageX
        e.y = e.pageY
      }

      this.position.set(e.x, e.y)

      gsap.to(this.lerpedPosition, !this.lastTime ? 0 : 0.6, {
        x: e.x,
        y: e.y,
        ease: 'power4.out'
      })

      if (!this.lastTime) {
        this.lastTime = performance.now()
        if (!this.lastPosition) this.lastPosition = new Vector2()
        this.lastPosition.set(e.x, e.y)
      }

      const deltaX = e.x - this.lastPosition.x
      const deltaY = e.y - this.lastPosition.y

      this.lastPosition.set(e.x, e.y)

      const time = performance.now()

      const delta = Math.max(14, time - this.lastTime)
      this.lastTime = time

      if (this.velocityTween) this.velocityTween.kill()
      this.velocityTween = gsap.to(this.velocity, 0.6, {
        x: deltaX / delta,
        y: deltaY / delta,
        ease: 'power4.out',
        onUpdate: () => {
          this.events.emit('mousemove-lerped', {
            ...this.$data,
            ...this.computed,
            originalEvent
          })
        },
        onComplete: () => {
          this.velocity.set(0, 0)
        }
      })

      this.events.emit('mousemove', {
        ...this.$data,
        ...this.computed,
        originalEvent
      })
    }
  }
})

Vue.prototype.$mouse = mouse

export default mouse
