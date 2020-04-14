import {
  EffectComposer,
  EffectPass,
  RenderPass,
  ChromaticAberrationEffect
} from 'postprocessing'

import AntialiasingEffect from './effects/antialiasing'

import viewport from '@/plugins/viewport'
import useGUI from '@/hooks/use-gui'

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
    // effects
    this.antialiasingEffect = await new AntialiasingEffect()
    this.chromaticAberrationEffect = new ChromaticAberrationEffect()

    // composer
    this.composer = new EffectComposer(this.renderer)

    // passes
    this.antialiasingPass = new EffectPass(
      this.camera,
      this.antialiasingEffect.smaaEffect
    )

    this.chromaticAberrationPass = new EffectPass(
      this.camera,
      this.chromaticAberrationEffect
    )

    // addPasses
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.composer.addPass(this.antialiasingPass)
    this.composer.addPass(this.chromaticAberrationPass)
  }

  render(deltaTime) {
    this.renderer.setSize(
      viewport.width * this.renderingScale,
      viewport.height * this.renderingScale
    )
    this.renderer.setPixelRatio = window.devicePixelRatio || 1

    if (this.composer) {
      this.composer.render(deltaTime)
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }

  initGUI() {
    const gui = useGUI()

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

    const rgbGUI = gui.postprocessing.addFolder('Chromatic Aberration')
    rgbGUI
      .add(this.chromaticAberrationEffect.uniforms.get('offset').value, 'x')
      .step(0.001)
    rgbGUI
      .add(this.chromaticAberrationEffect.uniforms.get('offset').value, 'y')
      .step(0.001)
  }
}
