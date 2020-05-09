export default class Raf {
  constructor(clock = new THREE.Clock()) {
    this.rafs = {}
    this.isRunning = false
    this.clock = clock
    this.paused = false

    this.fps = 60
    this.latest = 0
    this.delta = 0
    this.optimumDeltaTime = this.frameDuration / 1000

    this.loop()
  }

  get frameDuration() {
    return 1000 / this.fps
  }

  dispatch() {
    // clock
    const deltaTime = this.clock.getDelta()
    const time = this.clock.getElapsedTime()
    const lagSmoothing = deltaTime / (1000 / 60 / 1000)

    // callbacks
    Object.values(this.rafs)
      .sort((a, b) => {
        return a.priority - b.priority
      })
      .forEach((raf) => {
        raf.callback({ time, deltaTime, lagSmoothing })
      })
  }

  loop() {
    const now = performance.now()

    this.delta = now - this.latest

    if (this.delta > this.frameDuration) {
      this.dispatch()
    }

    this.latest = now - (this.delta % this.frameDuration)

    requestAnimationFrame(this.loop.bind(this))
  }

  add(id, callback, priority = 0) {
    if (this.rafs[id]) {
      return
    }
    this.rafs[id] = { id, callback, priority }
  }

  remove(id) {
    delete this.rafs[id]
  }
}
