import { EffectComposer, EffectPass, RenderPass } from 'postprocessing'

import AntialiasingEffect from './effects/antialiasing'

import viewport from '@/plugins/viewport'
import gui from '@/plugins/gui'

export default class Renderer {
  constructor({ renderer, camera, scene }) {
    this.renderer = renderer
    this.camera = camera
    this.scene = scene

    this.renderingScale = 1

    this.init()
  }

  async init() {
    await this.initComposer()
    this.initGUI()
  }

  async initComposer() {
    this.antialiasingEffect = await new AntialiasingEffect()

    // composer
    this.composer = new EffectComposer(this.renderer)

    // passes
    this.effectPass = new EffectPass(
      this.camera,
      this.antialiasingEffect.smaaEffect
    )

    // addPasses
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.composer.addPass(this.effectPass)
  }

  render(deltaTime) {
    this.renderer.setSize(
      viewport.width * this.renderingScale,
      viewport.height * this.renderingScale
    )
    this.renderer.setPixelRatio = window.devicePixelRatio || 1

    this.composer.render(deltaTime)
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
      .add(this, 'renderingScale')
      .min(0.2)
      .max(1)
      .step(0.1)
  }
}
