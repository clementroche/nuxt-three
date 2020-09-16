import Events from 'events'
import Vue from 'vue'

/* eslint-disable nuxt/no-env-in-hooks */

const scroll = new Vue({
  data() {
    if (!process.client) return {}
    return {
      scrollX: window.scrollX,
      scrollY: window.scrollY
    }
  },
  created() {
    if (!process.client) return
    this.events = new Events()
    this.events.setMaxListeners(Infinity)

    process.nextTick(() => {
      this.onScroll()
    })

    window.addEventListener('scroll', this.onScroll, false)
  },

  beforeDestroy() {
    if (!process.client) return
    window.removeEventListener('scroll', this.onScroll, false)
  },
  methods: {
    onScroll() {
      this.scrollX = window.scrollX
      this.scrollY = window.scrollY

      if (this.$nuxt) {
        this.$nuxt.$store.commit('scroll/setPosition', {
          x: this.scrollX,
          y: -this.scrollY
        })
      }
    }
  }
})

Vue.prototype.$scroll = scroll

export default scroll
