import events from '@/plugins/events'
import mouse from '@/plugins/mouse'
import gsap from '@/libs/gsap-bonus'

const instances = new Map()

class Kinesis {
  constructor(el, options) {
    this.el = el
    this.el.parentNode.style.perspective = '1000px'
    this.options = options

    this.onViewportResize()

    // this.el.addEventListener('mousemove', this.onMouseMove, false)
    // this.el.addEventListener('mouseleave', this.onMouseLeave, false)

    events.on('frame:frame', this.onMouseMove)
    events.on('viewport:resize', this.onViewportResize)
  }

  onMouseMove = (e) => {
    // const x = (e.offsetX / this.boundingRect.width) * 2 - 1
    // const y = (e.offsetY / this.boundingRect.height) * 2 - 1

    if (!mouse.hasMoved) return

    const { x, y } = mouse.lerpedNormalized
    gsap.set(this.el, {
      x: x * this.options.depth,
      y: -y * this.options.depth,
      rotateY: -x * this.options.depth,
      rotateX: -y * this.options.depth,
      duration: 1,
      ease: 'expo.out'
    })

    // this.tween?.kill()
    // this.tween = gsap.to(this.el, {
    //   x: x * this.options.depth,
    //   y: -y * this.options.depth,
    //   rotateY: -x * this.options.depth,
    //   rotateX: -y * this.options.depth,
    //   duration: 1,
    //   ease: 'expo.out'
    // })
  }

  // onMouseLeave = () => {
  //   this.tween?.kill()
  //   this.tween = gsap.to(this.el, {
  //     rotateY: 0,
  //     rotateX: 0,
  //     duration: 1,
  //     ease: 'expo.out'
  //   })
  // }

  onViewportResize = () => {
    this.boundingRect = this.el.getBoundingClientRect()
  }

  destroy() {
    // this.el.removeEventListener('mousemove', this.onMouseMove)
    // this.el.removeEventListener('mouseleave', this.onMouseLeave)

    events.off('frame:frame', this.onMouseMove)
    events.off('viewport:resize', this.onViewportResize)
  }
}

export default {
  inserted(el, binding) {
    const params = binding.value || {}

    const options = {
      depth: params.depth || 1
    }

    if (instances.has(el)) return
    instances.set(el, new Kinesis(el, options))
  },
  unbind(el) {
    if (!instances.has(el)) return
    instances.get(el).destroy()
    instances.delete(el)
  }
}
