import Vue from 'vue'
import events from '@/plugins/events'
import gsap from '@/libs/gsap-bonus'
import viewport from '@/plugins/viewport'

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

    events.on('frame:beforeFrame', this.loop)

    addEventListener('touchstart', this.onMouseMove, false)
    addEventListener('touchmove', this.onMouseMove, false)
    addEventListener('mousemove', this.onMouseMove, false)
  },
  beforeDestroy() {
    if (!process.client) return

    removeEventListener('touchstart', this.onMouseMove)
    removeEventListener('touchmove', this.onMouseMove)
    removeEventListener('mousemove', this.onMouseMove)
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

      events.emit('mouse:mousemove')

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
