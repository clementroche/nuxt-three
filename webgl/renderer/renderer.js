import Events from 'events'
import { EffectComposer, EffectPass, RenderPass } from 'postprocessing'

import viewport from '@/plugins/viewport'
import raf from '@/plugins/raf'

export default class Renderer {
  constructor({ canvas, scene, camera }) {
    this.canvas = canvas
    this.scene = scene
    this.camera = camera

    this.events = new Events()

    // renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      scene: this.scene,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
      // alpha: true
    })
    this.renderer.setSize(viewport.width, viewport.height)
    this.renderer.setPixelRatio = window.devicePixelRatio || 1

    // composer
    this.composer = new EffectComposer(this.renderer)
    this.effectPass = new EffectPass(camera)
    // this.effectPass.renderToScreen = true
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.composer.addPass(this.effectPass)

    raf.add('webgl', this.loop.bind(this), { index: 2 })
  }

  loop({ deltaTime, time }) {
    this.renderer.setSize(viewport.width, viewport.height)
    this.render({ deltaTime, time })
  }

  render({ deltaTime, time }) {
    this.composer.render(deltaTime)

    this.events.emit('render', this.renderer)
  }
}
