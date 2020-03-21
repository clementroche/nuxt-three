import IntersectionObserver from 'intersection-observer-polyfill'

export default {
  bind(el, binding) {
    // const params = {
    //   class: binding.value.class
    //     ? Array.isArray(binding.value.class)
    //       ? binding.value.class
    //       : [binding.value.class]
    //     : typeof binding.value === 'string'
    //     ? binding.value.split(/\s/)
    //     : [],

    //   multiple: !!binding.value.multiple,
    //   threshold: binding.value.threshold ? binding.value.threshold : 0,
    //   callback: binding.value.callback ? binding.value.callback : null
    // }

    // binding.value = params

    // const observer = new IntersectionObserver(
    //   (elements) => {
    //     elements.forEach(({ isIntersecting, target }) => {
    //       if (isIntersecting) {
    //         params.class.forEach((className) => {
    //           target.classList.add(className)
    //         })
    //         if (params.callback) {
    //           params.callback(true)
    //         }
    //         if (params.multiple === false) {
    //           binding.value.observer.unobserve(el)
    //         }
    //       } else {
    //         if (params.callback) {
    //           params.callback(false)
    //         }
    //         params.class.forEach((className) => {
    //           target.classList.remove(className)
    //         })
    //       }
    //     })
    //   },
    //   {
    //     threshold: params.threshold
    //   }
    // )

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
