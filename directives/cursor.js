import events from '@/plugins/events'

export default {
  bind(el, binding, { context }) {
    const params = binding.value

    function onMouseEnter() {
      events.emit('cursor:enter', params)
    }

    function onMouseLeave() {
      events.emit('cursor:enter', { type: 'default' })
    }

    el.vMouseEnter = onMouseEnter.bind(this)
    el.vMouseLeave = onMouseLeave.bind(this)

    el.addEventListener('mouseenter', el.vMouseEnter, false)
    el.addEventListener('mouseleave', el.vMouseLeave, false)
  },
  unbind(el, binding, { context }) {
    el.removeEventListener('mouseenter', el.vMouseEnter)
    el.removeEventListener('mouseleave', el.vMouseLeave)
  }
}
