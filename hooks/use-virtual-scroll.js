import Events from 'events'

class VirtualScroll {
  constructor() {
    this.events = new Events()

    const VS = require('virtual-scroll')
    this.virtualScroll = new VS({
      useKeyboard: false,
      mouseMultiplier: 0.5,
      passive: true,
      firefoxMultiplier: 33
    })

    this.virtualScroll.on(this.onScroll.bind(this))
  }

  onScroll(e) {
    this.events.emit('scroll', e)
  }
}

let scroll

const useVirtualScroll = () => {
  return scroll || (scroll = new VirtualScroll())
}

export default useVirtualScroll
