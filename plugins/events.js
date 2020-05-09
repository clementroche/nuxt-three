import Events from 'events'
import Vue from 'vue'

const events = new Events()

Vue.prototype.$events = events

export default events
