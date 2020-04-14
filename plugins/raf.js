export default class Raf {
  constructor(clock = new THREE.Clock()) {
    this.rafs = {}
    this.isRunning = false
    this.clock = clock
    this.paused = false
  }

  loop() {
    if (this.paused && !this.isRunning) return

    this.isRunning = true

    // clock
    const deltaTime = this.clock.getDelta()
    const time = this.clock.getElapsedTime()

    // callbacks
    Object.values(this.rafs)
      .sort((a, b) => {
        return a.priority - b.priority
      })
      .forEach((raf) => {
        raf.callback({ time, deltaTime })
      })

    this.rafId = requestAnimationFrame(this.loop.bind(this))
  }

  add(id, callback, priority = 0) {
    if (this.rafs[id]) {
      console.log(`raf.add(): ${id} already added`)
      return
    }
    this.rafs[id] = { id, callback, priority }

    if (!this.isRunning) {
      this.loop()
    }
  }

  set pause(bool) {
    this.paused = bool
    this.isRunning = !bool

    if (bool) {
      this.clock.stop()
      cancelAnimationFrame(this.rafId)
    } else {
      this.clock.start()
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
