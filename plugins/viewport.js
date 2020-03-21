import Events from 'events'
import Vue from 'vue'

/*  eslint-disable */

const viewport = new Vue({
  data() {
    if (!process.client) return {}
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.innerWidth / window.innerHeight
    }
  },
  created() {
    if (!process.client) return
    this.events = new Events()
    this.events.setMaxListeners(50)
    this.onWindowResize()
    window.addEventListener('resize', this.onWindowResize.bind(this), false)
  },
  methods: {
    onWindowResize() {
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.ratio = this.width / this.height

      let vh = this.height * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)

      this.events.emit('resize', this.$data)
    }
  }
})

Vue.prototype.$viewport = viewport

export default viewport
