import Events from 'events'
import Vue from 'vue'
const VirtualScroll =
  typeof window !== 'undefined' ? require('virtual-scroll') : null

const scroll = new Vue({
  created() {
    if (!process.client) return
    this.events = new Events()
    this.virtualScroll = new VirtualScroll({
      useKeyboard: false,
      mouseMultiplier: 0.5,
      passive: true,
      firefoxMultiplier: 33
    })

    this.virtualScroll.on(this.onScroll.bind(this))
  },
  methods: {
    onScroll(e) {
      this.events.emit('scroll', e)
    }
  }
})

Vue.prototype.$scroll = scroll

export default scroll
