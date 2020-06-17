import Events from 'events'
import gsap from 'gsap'
import Vue from 'vue'
import viewport from '@/plugins/viewport'

/* eslint-disable nuxt/no-env-in-hooks */

const mouse = new Vue({
  data() {
    return {
      hasMoved: false,
      lerped: new THREE.Vector2(-1000, -1000),
      position: new THREE.Vector2(-1000, -1000)
    }
  },
  computed: {
    normalized() {
      return new THREE.Vector2(
        (this.position.x / viewport.width) * 2 - 1,
        -(this.position.y / viewport.height) * 2 + 1
      )
    },
    lerpedNormalized() {
      return new THREE.Vector2(
        (this.lerped.x / viewport.width) * 2 - 1,
        -(this.lerped.y / viewport.height) * 2 + 1
      )
    }
  },
  created() {
    if (!process.client) return

    this.events = new Events()

    window.addEventListener('touchstart', this.onMouseMove, false)
    window.addEventListener('touchmove', this.onMouseMove, false)
    window.addEventListener('mousemove', this.onMouseMove, false)
  },
  beforeDestroy() {
    if (!process.client) return

    window.removeEventListener('touchstart', this.onMouseMove, false)
    window.removeEventListener('touchmove', this.onMouseMove, false)
    window.removeEventListener('mousemove', this.onMouseMove, false)
  },
  methods: {
    onMouseMove(event) {
      const e = event.targetTouches ? event.targetTouches[0] : event
      const { x, y } = e

      this.position.set(x, y)

      gsap.to(this.lerped, {
        duration: !this.hasMoved ? 0 : 0.6,
        x,
        y,
        ease: 'power4.out'
      })

      this.events.emit('mousemove', {
        ...this.$data,
        originalEvent: e
      })

      this.hasMoved = true
    }
  }
})

Vue.prototype.$mouse = mouse

export default mouse
