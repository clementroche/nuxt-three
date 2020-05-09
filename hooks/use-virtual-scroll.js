let virtualScroll

const useVirtualScroll = () => {
  if (!virtualScroll) {
    const VirtualScroll = require('virtual-scroll')
    virtualScroll = new VirtualScroll({
      useKeyboard: false,
      passive: false,
      mouseMultiplier: 0.5,
      firefoxMultiplier: 33
    })
  }

  return virtualScroll
}

export default useVirtualScroll
