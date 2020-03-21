import Stats from 'stats.js'

import clock from '@/plugins/clock'

class Raf {
  constructor() {
    this.rafs = {}
    this.isRunning = false

    this.stats = new Stats()
    document.body.appendChild(this.stats.dom)
  }

  loop() {
    this.stats.begin()

    this.isRunning = true

    // clock
    const deltaTime = clock.getDelta()
    const time = clock.getElapsedTime()

    // callbacks
    Object.values(this.rafs)
      .sort((a, b) => {
        return a.index - b.index
      })
      .forEach((raf) => {
        raf.callback({
          deltaTime,
          time
        })
      })

    this.stats.end()

    this.rafId = requestAnimationFrame(this.loop.bind(this))
  }

  add(id, callback, { index = 0 } = {}) {
    if (this.rafs[id]) {
      console.log(`raf.add(): ${id} already added`)
      return
    }
    this.rafs[id] = { id, callback, index }

    if (!this.isRunning) {
      this.loop()
    }
  }

  remove(id) {
    if (!this.rafs[id]) {
      console.warn(`raf.remove(): ${id} callback doesn't exist`)
    }
    delete this.rafs[id]

    if (Object.keys(this.rafs).length === 0) {
      this.isRunning = false
      cancelAnimationFrame(this.rafId)
    }
  }
}

export default new Raf()
