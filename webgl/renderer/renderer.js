import Events from 'events'
import { WEBGL } from 'three/examples/jsm/WebGL.js'
import { EffectComposer, EffectPass, RenderPass } from 'postprocessing'

import AntialiasingEffect from './effects/antialiasing'

import viewport from '@/plugins/viewport'
import raf from '@/plugins/raf'
import gui from '@/plugins/gui'

export default class Renderer {
  constructor({ canvas, scene, camera }) {
    this.canvas = canvas
    this.scene = scene
    this.camera = camera

    this.events = new Events()

    // rendering scale
    this.scale = 1

    // WEBGL 2
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
      // alpha: true
    })
    this.renderer.setSize(viewport.width, viewport.height)
    this.renderer.setPixelRatio = window.devicePixelRatio || 1

    this.init()
    raf.add('webgl', this.loop.bind(this), { index: 2 })
  }

  async init() {
    await this.initComposer()
    this.initGUI()
  }

  async initComposer() {
    this.antialiasingEffect = await new AntialiasingEffect()

    // composer
    this.composer = new EffectComposer(this.renderer)
    this.effectPass = new EffectPass(
      this.camera,
      this.antialiasingEffect.smaaEffect
    )

    // this.effectPass.renderToScreen = true
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.composer.addPass(this.effectPass)
  }

  initGUI() {
    const composer = this.composer
    const renderer = composer.getRenderer()
    const context = renderer.getContext()

    const effectPass = this.effectPass

    const AAMode = Object.assign(
      {
        DISABLED: 0,
        SMAA: 1
      },
      !renderer.capabilities.isWebGL2
        ? {}
        : {
            MSAA: 2
          }
    )

    const params = {
      antialiasing: AAMode.SMAA
    }

    gui.postprocessing.add(params, 'antialiasing', AAMode).onChange(() => {
      const mode = Number(params.antialiasing)

      effectPass.enabled = mode === AAMode.SMAA

      composer.multisampling =
        mode === AAMode.MSAA
          ? Math.min(4, context.getParameter(context.MAX_SAMPLES))
          : 0
    })

    gui.rendering
      .add(this, 'scale')
      .min(0.2)
      .max(1)
      .step(0.1)
  }

  loop({ deltaTime, time }) {
    this.renderer.setSize(
      viewport.width * this.scale,
      viewport.height * this.scale
    )
    this.render({ deltaTime, time })
  }

  render({ deltaTime, time }) {
    if (this.composer) {
      this.composer.render(deltaTime)
    } else {
      this.renderer.render(this.scene, this.camera)
    }

    this.events.emit('render', this.renderer)
  }
}
