import Events from 'events'

import mouse from '@/plugins/mouse'

import getStore from '@/store'
const store = getStore()

class Raycaster {
  constructor() {
    this.raycaster = new THREE.Raycaster()

    this.targets = {}

    this.events = new Events()

    mouse.events.on('mousemove', this.raycast.bind(this))
  }

  addTarget(object) {
    if (!object.uuid) return
    this.targets[object.uuid] = object
  }

  removeTarget(object) {
    if (!this.targets[object.uuid]) return
    delete this.targets[object.uuid]
  }

  raycast() {
    const camera = store.getters['webgl/rendererCamera']
    if (!camera) return

    this.raycaster.setFromCamera(mouse.normalized, camera)

    const intersects = this.raycaster.intersectObjects(
      Object.values(this.targets),
      true
    )

    this.events.emit('intersection', intersects)
  }
}

export default new Raycaster()
