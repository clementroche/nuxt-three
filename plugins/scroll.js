import Events from 'events'
import Vue from 'vue'

/* eslint-disable nuxt/no-env-in-hooks */

const scroll = new Vue({
  data() {
    if (!process.client) return {}
    return {
      scrollY: window.scrollY
    }
  },
  created() {
    if (!process.client) return
    this.events = new Events()
    this.events.setMaxListeners(Infinity)

    this.onScroll()
    window.addEventListener('scroll', this.onScroll, false)
  },
  beforeDestroy() {
    if (!process.client) return
    window.removeEventListener('scroll', this.onScroll, false)
  },
  methods: {
    onScroll() {
      this.scrollY = window.scrollY

      if (this.$nuxt) {
        console.log('scroll', this.scrollY)
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
