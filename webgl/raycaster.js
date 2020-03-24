import Events from 'events'

import mouse from '@/plugins/mouse'

export default class Raycaster {
  constructor(camera) {
    this.camera = camera

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
    this.raycaster.setFromCamera(mouse.normalized, this.camera)

    const intersects = this.raycaster.intersectObjects(
      Object.values(this.targets),
      true
    )

    this.events.emit('intersection', intersects)
  }
}
