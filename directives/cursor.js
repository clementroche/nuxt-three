import events from '@/plugins/events'

const instances = new Map()

class Cursor {
  constructor(el, options) {
    this.el = el
    this.options = options

    this.el.addEventListener('mouseenter', this.onMouseEnter, false)
    this.el.addEventListener('mouseleave', this.onMouseLeave, false)
  }

  onMouseEnter = () => {
    events.emit('cursor:enter', this.options)
  }

  onMouseLeave = () => {
    events.emit('cursor:enter', { type: 'default' })
  }

  destroy() {
    this.el.removeEventListener('mouseenter', this.onMouseEnter)
    this.el.removeEventListener('mouseleave', this.onMouseLeave)
  }
}

export default {
  inserted(el, binding) {
    const params = binding.value || {}
    console.log(params)

    if (instances.has(el)) return
    instances.set(el, new Cursor(el, params))
  },
  unbind(el) {
    if (!instances.has(el)) return
    instances.get(el).destroy()
    instances.delete(el)
  }
}
