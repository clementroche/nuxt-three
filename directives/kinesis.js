import gsap from 'gsap'
import mouse from '@/plugins/mouse'

export default {
  bind(el, binding, { context }) {
    const params = binding.value || {}

    const options = {
      depth: params.depth || 1
    }

    function onMouseMove() {
      gsap.to(el, {
        duration: 1,
        ease: 'power4.out',
        x: options.depth * mouse.normalized.x,
        y: options.depth * -mouse.normalized.y
      })
    }

    el.vKinesis = onMouseMove.bind(this)

    mouse.events.on('mousemove', el.vKinesis)
  },
  unbind(el, binding, { context }) {
    mouse.events.off('mousemove', el.vKinesis)
  }
}
