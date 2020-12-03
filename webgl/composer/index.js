import Events from 'events'

import {
  EffectComposer,
  EffectPass,
  RenderPass,
  ChromaticAberrationEffect,
  BlendFunction,
  KernelSize,
  // GlitchEffect,
  GlitchMode
} from 'postprocessing'

import AntialiasingEffect from './effects/antialiasing'
import BarrelEffect from './effects/barrel'

// import MouseFlowmapEffect from './effects/mouse-flowmap'

// import FluidSimulation from '@/assets/js/fluid-simulation'

import viewport from '@/plugins/viewport'
import useGUI from '@/hooks/use-gui'

export default class Composer {
  constructor({ renderer, camera, scene }) {
    this.renderer = renderer
    this.camera = camera
    this.scene = scene

    this.enabled = true

    this.events = new Events()

    this.init()
  }

  async init() {
    await this.initComposer()
    this.initGUI()
  }

  async load() {
    this.AAEffect = await new AntialiasingEffect()

    // this.loadingManager = new THREE.LoadingManager()
    // this.assets = new Map()
    // const textureLoader = new THREE.TextureLoader(this.loadingManager)

    // return new Promise((resolve, reject) => {
    //   if (this.assets.size === 0) {
    //     this.loadingManager.onLoad = () => setTimeout(resolve, 250)
    //     this.loadingManager.onError = reject

    //     textureLoader.load('/images/perturb.jpg', (t) => {
    //       this.assets.set('perturbation-map', t)
    //     })
    //   } else {
    //     resolve()
    //   }
    // })
  }

  async initComposer() {
    this.chromaticAberrationEffect = new ChromaticAberrationEffect()
    this.barrelEffect = new BarrelEffect({ intensity: 0 })

    await this.load()

    this.AAPass = new EffectPass(this.camera, this.AAEffect.smaaEffect)

    // this.glitchEffect = new GlitchEffect({
    //   perturbationMap: this.assets.get('perturbation-map')
    // })
    // this.glitchEffect.mode = 1

    // composer
    this.composer = new EffectComposer(this.renderer)

    this.chromaticAberrationPass = new EffectPass(
      this.camera,
      this.chromaticAberrationEffect
    )

    this.barrelPass = new EffectPass(this.camera, this.barrelEffect)
    // this.glitchPass = new EffectPass(this.camera, this.glitchEffect)

    // addPasses
    this.composer.addPass(new RenderPass(this.scene, this.camera))

    this.composer.addPass(this.AAPass)
    this.composer.addPass(this.chromaticAberrationPass)
    this.composer.addPass(this.barrelPass)
    // this.composer.addPass(this.glitchPass)

    this.events.emit('load')
  }

  render(clock) {
    if (this.fluidSimulation) {
      const texture = this.fluidSimulation.update(clock)
      this.mouseFlowmapEffect.uniforms.get('tFluid').value = texture
    }

    this.renderer.setRenderTarget(null)
    this.renderer.clear()

    if (this.composer && this.enabled) {
      this.composer.setSize(viewport.width, viewport.height)
      this.composer.render(clock.deltaTime)
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }

  initGUI() {
    const gui = useGUI()

    gui.postprocessing.add(this, 'enabled')

    if (this.chromaticAberrationEffect) {
      const rgbGUI = gui.postprocessing.addFolder('Chromatic Aberration')
      rgbGUI
        .add(this.chromaticAberrationEffect.uniforms.get('offset').value, 'x')
        .step(0.001)
      rgbGUI
        .add(this.chromaticAberrationEffect.uniforms.get('offset').value, 'y')
        .step(0.001)
    }

    if (this.barrelEffect) {
      const barrelGUI = gui.postprocessing.addFolder('Barrel Deformation')
      barrelGUI
        .add(this.barrelEffect.uniforms.get('intensity'), 'value')
        .min(-0.5)
        .max(0.5)
        .step(0.01)
    }

    if (this.bloomEffect) {
      this.initBloomGUI()
    }

    if (this.glitchEffect) {
      this.initGlitchGUI()
    }

    if (this.fluidSimulation) {
      this.initMouseDistortionGUI()
    }
  }

  initMouseDistortionGUI() {
    const GUI = useGUI()

    const menu = GUI.postprocessing._addFolder('Mouse distortion')

    menu
      .add(this.fluidSimulation, 'iterations')
      .min(1)
      .max(10)
      .step(1)
    menu
      .add(this.fluidSimulation, 'densityDissipation')
      .min(0)
      .max(1)
      .step(0.001)
    menu
      .add(this.fluidSimulation, 'velocityDissipation')
      .min(0)
      .max(1)
      .step(0.01)
    menu
      .add(this.fluidSimulation, 'pressureDissipation')
      .min(0)
      .max(1)
      .step(0.01)
    menu
      .add(this.fluidSimulation, 'curlStrength')
      .min(0)
      .max(50)
      .step(1)
    menu
      .add(this.fluidSimulation, 'radius')
      .min(0)
      .max(1)
      .step(0.01)
  }

  initGlitchGUI() {
    const GUI = useGUI()
    const menu = GUI.postprocessing._addFolder('Glitch')

    const effect = this.glitchEffect
    const perturbationMap = effect.getPerturbationMap()
    const uniforms = effect.uniforms
    const delay = effect.delay
    const duration = effect.duration
    const strength = effect.strength

    const params = {
      'glitch mode': effect.mode,
      'custom pattern': true,
      'min delay': delay.x,
      'max delay': delay.y,
      'min duration': duration.x,
      'max duration': duration.y,
      'weak glitches': strength.x,
      'strong glitches': strength.y,
      'glitch ratio': effect.ratio,
      columns: uniforms.get('columns').value
    }

    menu.add(params, 'glitch mode', GlitchMode).onChange(() => {
      effect.mode = Number(params['glitch mode'])
    })

    menu.add(params, 'custom pattern').onChange(() => {
      if (params['custom pattern']) {
        effect.setPerturbationMap(perturbationMap)
      } else {
        effect.setPerturbationMap(effect.generatePerturbationMap(64))
      }
    })

    menu
      .add(params, 'min delay')
      .min(0.0)
      .max(2.0)
      .step(0.001)
      .onChange(() => {
        delay.x = params['min delay']
      })

    menu
      .add(params, 'max delay')
      .min(2.0)
      .max(4.0)
      .step(0.001)
      .onChange(() => {
        delay.y = params['max delay']
      })

    menu
      .add(params, 'min duration')
      .min(0.0)
      .max(0.6)
      .step(0.001)
      .onChange(() => {
        duration.x = params['min duration']
      })

    menu
      .add(params, 'max duration')
      .min(0.6)
      .max(1.8)
      .step(0.001)
      .onChange(() => {
        duration.y = params['max duration']
      })

    const folder = menu._addFolder('Strength')

    folder
      .add(params, 'weak glitches')
      .min(0.0)
      .max(1.0)
      .step(0.001)
      .onChange(() => {
        strength.x = params['weak glitches']
      })

    folder
      .add(params, 'strong glitches')
      .min(0.0)
      .max(1.0)
      .step(0.001)
      .onChange(() => {
        strength.y = params['strong glitches']
      })

    folder.open()

    menu
      .add(params, 'glitch ratio')
      .min(0.0)
      .max(1.0)
      .step(0.001)
      .onChange(() => {
        effect.ratio = Number.parseFloat(params['glitch ratio'])
      })

    menu
      .add(params, 'columns')
      .min(0.0)
      .max(0.5)
      .step(0.001)
      .onChange(() => {
        uniforms.get('columns').value = params.columns
      })
  }

  initBloomGUI() {
    const GUI = useGUI()
    const menu = GUI.postprocessing._addFolder('Bloom')

    const effect = this.bloomEffect
    const blendMode = effect.blendMode

    const params = {
      resolution: effect.resolution.height,
      'kernel size': effect.blurPass.kernelSize,
      'blur scale': effect.blurPass.scale,
      intensity: effect.intensity,
      luminance: {
        filter: effect.luminancePass.enabled,
        threshold: effect.luminanceMaterial.threshold,
        smoothing: effect.luminanceMaterial.smoothing
      },
      opacity: blendMode.opacity.value,
      'blend mode': blendMode.blendFunction
    }

    menu.add(params, 'resolution', [240, 360, 480, 720, 1080]).onChange(() => {
      effect.resolution.height = Number(params.resolution)
    })

    menu.add(params, 'kernel size', KernelSize).onChange(() => {
      effect.blurPass.kernelSize = Number(params['kernel size'])
    })

    menu
      .add(params, 'blur scale')
      .min(0.0)
      .max(1.0)
      .step(0.01)
      .onChange(() => {
        effect.blurPass.scale = Number(params['blur scale'])
      })

    menu
      .add(params, 'intensity')
      .min(0.0)
      .max(3.0)
      .step(0.01)
      .onChange(() => {
        effect.intensity = Number(params.intensity)
      })

    const folder = menu._addFolder('Luminance')

    folder.add(params.luminance, 'filter').onChange(() => {
      effect.luminancePass.enabled = params.luminance.filter
    })

    folder
      .add(params.luminance, 'threshold')
      .min(0.0)
      .max(1.0)
      .step(0.001)
      .onChange(() => {
        effect.luminanceMaterial.threshold = Number(params.luminance.threshold)
      })

    folder
      .add(params.luminance, 'smoothing')
      .min(0.0)
      .max(1.0)
      .step(0.001)
      .onChange(() => {
        effect.luminanceMaterial.smoothing = Number(params.luminance.smoothing)
      })

    menu
      .add(params, 'opacity')
      .min(0.0)
      .max(1.0)
      .step(0.01)
      .onChange(() => {
        blendMode.opacity.value = params.opacity
      })

    menu.add(params, 'blend mode', BlendFunction).onChange(() => {
      blendMode.setBlendFunction(Number(params['blend mode']))
    })
  }
}
