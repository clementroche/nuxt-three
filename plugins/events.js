import Events from 'events'
import Vue from 'vue'

const events = new Events()
events.setMaxListeners(Infinity)

Vue.prototype.$events = events

export default events
