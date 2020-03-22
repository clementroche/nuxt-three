import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import viewport from '@/plugins/viewport'
import gui from '@/plugins/gui'

import Renderer from '@/webgl/renderer/renderer'
import raycaster from '@/webgl/raycaster'
import rendererStats from '@/webgl/renderer-stats'

export class WebGL {
  constructor(canvas) {
    // canvas
    this.canvas = canvas

    // scene
    this.scene = new THREE.Scene()

    // camera
    this.camera = new THREE.OrthographicCamera(
      viewport.width / -2,
      viewport.width / 2,
      viewport.height / 2,
      viewport.height / -2,
      -10000,
      10000
    )
    this.camera.position.set(500, 500, 500)
    this.camera.lookAt(this.scene.position)

    // controls
    this.cameraControls = new OrbitControls(
      this.camera,
      document.getElementById('__nuxt')
    )

    // raycaster
    raycaster.camera = this.camera

    // renderer
    this.renderer = new Renderer({
      canvas: this.canvas,
      camera: this.camera,
      scene: this.scene
    })

    this.addCube()
  }

  init() {
    this.initEvents()
    this.initGUI()
  }

  initEvents() {
    viewport.events.on('resize', this.onWindowResize.bind(this))
    this.renderer.events.on('render', (renderer) => {
      rendererStats.update(renderer.info)
    })
  }

  initGUI() {
    gui.camera.add(this.cameraControls, 'enabled').name('controls')
  }

  addCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshNormalMaterial()
    this.cube = new THREE.Mesh(geometry, material)
    this.cube.scale.setScalar(200)

    this.scene.add(this.cube)

    raycaster.addTarget(this.cube)

    raycaster.events.on('intersection', (intersections) => {
      const cubeIntersection = intersections.find(
        (intersection) => intersection.object.uuid === this.cube.uuid
      )

      if (cubeIntersection) {
        this.cube.scale.setScalar(250)
      } else {
        this.cube.scale.setScalar(200)
      }
    })
  }

  onWindowResize() {
    this.camera.left = viewport.width / -2
    this.camera.right = viewport.width / 2
    this.camera.top = viewport.height / 2
    this.camera.bottom = viewport.height / -2
    this.camera.updateProjectionMatrix()
  }
}

export default ({ app }, inject) => {
  inject('getWebGL', () => {
    return app.$webgl
  })

  inject('createWebGL', (canvas) => {
    app.$webgl = new WebGL(canvas)
    return app.$webgl
  })

  inject('destroyWebGL', () => {
    app.$webgl = null
  })
}
