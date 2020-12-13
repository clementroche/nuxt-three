import mouse from '@/plugins/mouse'
import events from '@/plugins/events'

export default class Raycaster {
  constructor(camera) {
    this.camera = camera

    this.raycaster = new THREE.Raycaster()

    this.targets = {}

    events.on('mouse:mousemove', this.cast.bind(this, 'mousemove'))
    addEventListener('click', this.cast.bind(this, 'click'), false)
  }

  addTarget(object) {
    if (!object.uuid) return
    this.targets[object.uuid] = object
  }

  removeTarget(object) {
    if (!this.targets[object.uuid]) return
    delete this.targets[object.uuid]
  }

  cast = (eventType) => {
    this.raycaster.setFromCamera(mouse.normalized, this.camera)

    const intersects = this.raycaster.intersectObjects(
      Object.values(this.targets),
      true
    )

    events.emit('raycaster:' + eventType, intersects)
  }
}
