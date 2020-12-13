import Vue from 'vue'
import events from '@/plugins/events'
import gsap from '@/libs/gsap-bonus'

const frame = new Vue({
  created() {
    if (!process.client) return
    gsap.ticker.add(this.onTick)
  },
  beforeDestroy() {
    if (!process.client) return
    gsap.ticker.remove(this.onTick)
  },
  methods: {
    onTick(time, deltaTime, frame) {
      const props = { time, deltaTime, frame }
      events.emit('frame:statsBegin', props)

      events.emit('frame:beforeFrame', props)
      events.emit('frame:frame', props)
      events.emit('frame:afterFrame', props)

      events.emit('frame:beforeRender', props)
      events.emit('frame:render', props)
      events.emit('frame:afterRender', props)

      events.emit('frame:statsEnd', props)
    }
  }
})

Vue.prototype.$frame = frame

export default frame
