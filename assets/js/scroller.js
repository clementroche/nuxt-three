import Events from 'events'
import gsap from 'gsap'

// import viewport from '@/plugins/viewport'

import useVirtualScroll from '@/hooks/use-virtual-scroll'
import useRAF from '@/hooks/use-raf'
import uuidv4 from '@/assets/js/uuidv4'

export default class Scroller {
  constructor(container) {
    this.container = container

    this.uuid = uuidv4()
    this.events = new Events()

    this.reset()
    this.resize()

    const virtualScroll = useVirtualScroll()

    this.scrollHandler = this.onScroll.bind(this)
    virtualScroll.on(this.scrollHandler)

    const RAF = useRAF()
    RAF.add('pre-scroller' + this.uuid, this.preLoop.bind(this), -11)
    RAF.add('scroller' + this.uuid, this.loop.bind(this), 1)
  }

  reset() {
    this.scrollPosition = { x: 0, y: 0 }
    this.currentScrollPosition = { x: 0, y: 0 }
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
    const virtualScroll = useVirtualScroll()
    virtualScroll.off(this.scrollHandler)

    const RAF = useRAF()
    RAF.remove('pre-scroller' + this.uuid)
    RAF.remove('scroller' + this.uuid)
  }

  scrollTo({ x, y }, duration) {
    this.scrollPosition = { x, y }
    gsap.to(this.currentScrollPosition, {
      duration,
      ease: 'power4.out',
      x,
      y
    })
  }

  onScroll({ deltaX, deltaY }) {
    if (!this.enabled) return

    this.scrollPosition.x += deltaY + deltaX
    this.scrollPosition.x = Math.max(this.maxScroll.x, this.scrollPosition.x)
    this.scrollPosition.x = Math.min(0, this.scrollPosition.x)

    this.scrollPosition.y += deltaY
    this.scrollPosition.y = Math.max(this.maxScroll.y, this.scrollPosition.y)
    this.scrollPosition.y = Math.min(0, this.scrollPosition.y)

    this.scrollTo(this.scrollPosition, 1)
  }

  preLoop() {
    this.lastScrollPosition = { ...this.currentScrollPosition }
  }

  loop() {
    this.events.emit('scroll', {
      velocity: this.velocity,
      position: this.currentScrollPosition,
      progress: {
        x: this.currentScrollPosition.x / this.maxScroll.x,
        y: this.currentScrollPosition.y / this.maxScroll.y
      }
    })
  }

  get velocity() {
    return {
      x: this.currentScrollPosition.x - this.lastScrollPosition.x,
      y: this.currentScrollPosition.y - this.lastScrollPosition.y
    }
  }
}
