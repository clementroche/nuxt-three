import Events from 'events'
import gsap from 'gsap'
import Vue from 'vue'
import viewport from '@/plugins/viewport'

// https://github.com/oframe/ogl/blob/master/examples/mouse-flowmap.html

/* eslint nuxt/no-globals-in-created:0 */

const mouse = new Vue({
  data() {
    return {
      lerpedPosition: new THREE.Vector2(-1000, -1000),
      position: new THREE.Vector2(-1000, -1000),
      velocity: new THREE.Vector2(0, 0)
    }
  },
  computed: {
    normalized() {
      return new THREE.Vector2(
        (this.position.x / viewport.width) * 2 - 1,
        -(this.position.y / viewport.height) * 2 + 1
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
    onMouseMove(e) {
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
        if (!this.lastPosition) this.lastPosition = new THREE.Vector2()
        this.lastPosition.set(e.x, e.y)
      }

      const deltaX = e.x - this.lastPosition.x
      const deltaY = e.y - this.lastPosition.y

      this.lastPosition.set(e.x, e.y)

      const time = performance.now()

      const delta = Math.max(14, time - this.lastTime)
      this.lastTime = time

      this.velocity.x = deltaX / delta
      this.velocity.y = deltaY / delta

      this.velocity.needsUpdate = true
    }
  }
})

Vue.prototype.$mouse = mouse

export default mouse
