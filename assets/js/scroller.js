import Events from 'events'
import gsap from 'gsap'
import useRAF from '@/hooks/use-raf'
import uuidv4 from '@/assets/js/uuidv4'

export default class Scroller {
  constructor(container) {
    this.container = container

    this.uuid = uuidv4()
    this.events = new Events()
    this.events.setMaxListeners(Infinity)

    this.resize()
    this.reset()

    const RAF = useRAF()
    RAF.add('pre-scroller' + this.uuid, this.preLoop, -11)
    RAF.add('scroller' + this.uuid, this.loop, -1)
  }

  reset() {
    this.scrollPosition = { x: 0, y: 0 }
    this.lerpedScrollPosition = { x: 0, y: 0 }
    this.lastLerpedScrollPosition = { ...this.lerpedScrollPosition }

    this.dispatch()
  }

  resize() {
    this.boundingRect = this.container.getBoundingClientRect()

    this.maxScroll = {
      x: (this.boundingRect.width - this.container.parentNode.offsetWidth) * -1,
      y:
        (this.boundingRect.height - this.container.parentNode.offsetHeight) * -1
    }
  }

  destroy() {
    const RAF = useRAF()
    RAF.remove('pre-scroller' + this.uuid)
    RAF.remove('scroller' + this.uuid)
  }

  scrollTo({ x, y }, duration = 1) {
    this.scrollPosition = { x, y }
    if (duration === false) {
      this.lerpedScrollPosition = { ...this.scrollPosition }
    } else {
      if (this.tween) this.tween.kill()
      this.tween = gsap.to(this.lerpedScrollPosition, {
        duration,
        ease: 'power4.out',
        x,
        y
      })

      return this.tween
    }
  }

  onScroll({ deltaX, deltaY }) {
    this.scrollPosition.x += deltaX
    if (!this.loopX) {
      this.scrollPosition.x = Math.max(this.maxScroll.x, this.scrollPosition.x)
      this.scrollPosition.x = Math.min(0, this.scrollPosition.x)
    }

    this.scrollPosition.y += deltaY
    if (!this.loopY) {
      this.scrollPosition.y = Math.max(this.maxScroll.y, this.scrollPosition.y)
      this.scrollPosition.y = Math.min(0, this.scrollPosition.y)
    }

    this.scrollTo(this.scrollPosition)
  }

  preLoop = () => {
    this.lastVelocity = { ...this.velocity }
    this.lastLerpedScrollPosition = { ...this.lerpedScrollPosition }
  }

  loop = () => {
    if (this.disabled) return
    // if (Math.abs(this.velocity.x) + Math.abs(this.velocity.y) > 0) {
    this.dispatch()
    // }
  }

  dispatch = () => {
    this.events.emit('scroll', {
      lastScrollToProgress: this.tween ? this.tween._time / this.tween._dur : 0,
      velocity: this.velocity,
      position: this.lerpedScrollPosition,
      progress: {
        x: this.lerpedScrollPosition.x / this.maxScroll.x,
        y: this.lerpedScrollPosition.y / this.maxScroll.y
      }
    })
  }

  get velocity() {
    return {
      x: this.lerpedScrollPosition.x - this.lastLerpedScrollPosition.x,
      y: this.lerpedScrollPosition.y - this.lastLerpedScrollPosition.y
    }
  }
}
