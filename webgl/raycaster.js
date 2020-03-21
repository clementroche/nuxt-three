import Events from 'events'
import store from '@/store'

import mouse from '@/plugins/mouse'
import raf from '@/plugins/raf'

class Raycaster {
  constructor() {
    this.raycaster = new THREE.Raycaster()

    this.targets = {}

    setTimeout(() => {
      console.log(store)
    }, 1000)

    this.events = new Events()

    raf.add('raycaster', this.loop.bind(this), { index: 0 })
  }

  addTarget(object) {
    if (!object.uuid) return
    this.targets[object.uuid] = object
  }

  removeTarget(object) {
    if (!this.targets[object.uuid]) return
    delete this.targets[object.uuid]
  }

  loop() {
    if (!this.camera) return

    this.raycaster.setFromCamera(mouse.normalized, this.camera)

    const intersects = this.raycaster.intersectObjects(
      Object.values(this.targets),
      true
    )

    this.events.emit('intersection', intersects)
  }
}

export default new Raycaster()
