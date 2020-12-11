import Events from 'events'
import Vue from 'vue'
import gsap from '@/libs/gsap-bonus'
import viewport from '@/plugins/viewport'
import useFrame from '@/hooks/use-frame'

/* eslint-disable nuxt/no-env-in-hooks */

const mouse = new Vue({
  data() {
    return {
      hasMoved: false,
      position: new THREE.Vector2(-1000, -1000),
      lerpedPosition: new THREE.Vector2(-1000, -1000),
      lastLerpedPosition: new THREE.Vector2(-1000, -1000)
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
        (this.lerpedPosition.x / viewport.width) * 2 - 1,
        -(this.lerpedPosition.y / viewport.height) * 2 + 1
      )
    },
    lerpedVelocity() {
      return new THREE.Vector2(
        this.lerpedPosition.x - this.lastLerpedPosition.x,
        this.lerpedPosition.y - this.lastLerpedPosition.y
      )
    }
  },
  created() {
    if (!process.client) return

    const frame = useFrame()
    frame.on('beforeFrame', this.loop)

    this.events = new Events()
    this.events.setMaxListeners(Infinity)

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
    loop() {
      this.lastLerpedPosition = { ...this.lerpedPosition }
    },
    onMouseMove(e) {
      if (e.changedTouches && e.changedTouches.length) {
        e.x = e.changedTouches[0].pageX
        e.y = e.changedTouches[0].pageY
      }
      if (e.x === undefined) {
        e.x = e.pageX
        e.y = e.pageY
      }
      const { x, y } = e

      this.position.set(x, y)

      this.events.emit('mousemove')

      this.tween?.kill()
      this.tween = gsap.to(this.lerpedPosition, {
        duration: this.hasMoved ? 1 : 0,
        x,
        y,
        ease: 'expo.out'
      })

      this.hasMoved = true
    }
  }
})

Vue.prototype.$mouse = mouse

export default mouse
