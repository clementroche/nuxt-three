import mouse from '@/plugins/mouse'
import useFrame from '@/hooks/use-frame'

const instances = new Map()

class Kinesis {
  constructor(el, options) {
    this.el = el
    this.options = options
    const frame = useFrame()
    frame.on('frame', this.onFrame)
  }

  onFrame = () => {
    if (!mouse.hasMoved) return
    const depth = this.options.depth
    this.el.style.transform = `translate3d(${mouse.lerpedNormalized.x *
      depth}px,${-mouse.lerpedNormalized.y * depth}px,0px)`
  }

  destroy() {
    const frame = useFrame()
    frame.off('frame', this.onFrame)
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
