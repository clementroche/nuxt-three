import Stats from 'stats.js'

import viewport from '@/plugins/viewport'
import raf from '@/plugins/raf'

let webgl

class WebGL {
  constructor() {
    // clock
    this.clock = new THREE.Clock()

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

    // camera controls
    const {
      OrbitControls
    } = require('three/examples/jsm/controls/OrbitControls.js')
    this.cameraControls = new OrbitControls(
      this.camera,
      document.getElementById('__nuxt')
    )

    // canvas
    this.canvas = document.createElement('canvas')

    // WEBGL2
    const { WEBGL } = require('three/examples/jsm/WebGL')
    const context = this.canvas.getContext(
      WEBGL.isWebGL2Available() ? 'webgl2' : 'webgl',
      { alpha: false }
    )

    // renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      context,
      scene: this.scene,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    })
    this.renderer.setSize(viewport.width, viewport.height)
    this.renderer.setPixelRatio = window.devicePixelRatio || 1

    // composer
    const Composer = require('@/webgl/composer').default
    this.composer = new Composer({
      camera: this.camera,
      renderer: this.renderer,
      scene: this.scene
    })

    // stats
    this.stats = new Stats()
    document.body.appendChild(this.stats.dom)
    raf.add('stats-begin', this.stats.begin, -1000)
    raf.add('stats-end', this.stats.end, 1000)

    // raycaster
    const Raycaster = require('@/webgl/raycaster').default
    this.raycaster = new Raycaster(this.camera)

    // events
    viewport.events.on('resize', this.onWindowResize.bind(this))
  }

  get viewsize() {
    let width, height
    if (this.camera.type === 'PerspectiveCamera') {
      const distance = this.camera.position.z
      const vFov = (this.camera.fov * Math.PI) / 180
      height = 2 * Math.tan(vFov / 2) * distance
      width = height * viewport.ratio
    } else if (this.camera.type === 'OrthographicCamera') {
      width = viewport.width
      height = viewport.height
    }

    return { width, height }
  }

  onWindowResize() {
    this.camera.left = viewport.width / -2
    this.camera.right = viewport.width / 2
    this.camera.top = viewport.height / 2
    this.camera.bottom = viewport.height / -2
    this.camera.updateProjectionMatrix()
  }

  destroy() {}
}

const useWebGL = () => {
  return webgl || (webgl = new WebGL())
}

export default useWebGL
