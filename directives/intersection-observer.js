import IntersectionObserver from 'intersection-observer-polyfill'

export default {
  bind(el, binding) {
    const params = binding.value

    const options = {
      root: params.root || null,
      rootMargin: params.rootMargin || '0px',
      threshold: params.threshold || 0
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (params.triggerOnce) {
            observer.unobserve(el)
          }
        }

        if (params.onChange) {
          params.onChange(entry.isIntersecting, entry)
        }
      })
    }, options)

    binding.value.observer = observer
    observer.observe(el)
  },

  unbind(el, binding) {
    const params = binding.value
    if (params.observer) {
      params.observer.unobserve(el)
    }
  }
}
