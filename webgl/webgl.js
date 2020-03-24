import useWebGL from '@/hooks/use-webgl'

class WebGL {
  constructor() {
    const { scene } = useWebGL()

    this.group = new THREE.Object3D()
    this.group.scale.setScalar(250)

    scene.add(this.group)

    this.init()
  }

  init() {
    this.initCamera()

    this.addBox()
  }

  initCamera() {
    const { scene, camera } = useWebGL()

    camera.position.set(500, 500, 500)
    camera.lookAt(scene.position)
  }

  addBox() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshNormalMaterial()
    const cube = new THREE.Mesh(geometry, material)
    this.group.add(cube)

    const { raycaster } = useWebGL()

    raycaster.addTarget(cube)

    raycaster.events.on('intersection', (intersections) => {
      const cubeIsIntersected = intersections.filter(
        (intersection) => intersection.object.uuid === cube.uuid
      )

      if (cubeIsIntersected[0]) {
        cube.scale.setScalar(1.1)
      } else {
        cube.scale.setScalar(1)
      }
    })
  }

  destroy() {
    const { scene } = useWebGL()
    scene.remove(this.group)
  }
}

export default ({ app }, inject) => {
  inject('getWebgl', () => {
    return app.$webgl || app.$createWebgl()
  })

  inject('createWebgl', () => {
    app.$webgl = new WebGL()
    return app.$webgl
  })

  inject('destroyWebgl', () => {
    app.$webgl.destroy()
    app.$webgl = null
  })
}
