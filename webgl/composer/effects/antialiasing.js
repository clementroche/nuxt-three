import {
  SMAAEffect,
  SMAAImageLoader,
  SMAAPreset,
  EdgeDetectionMode,
  // TextureEffect,
  BlendFunction
} from 'postprocessing'

import useGUI from '@/hooks/use-gui'

export default class AntialiasingEffect {
  constructor() {
    return new Promise((resolve, reject) => {
      this.load().then(() => {
        this.smaaEffect = new SMAAEffect(
          this.assets.get('smaa-search'),
          this.assets.get('smaa-area'),
          SMAAPreset.HIGH,
          EdgeDetectionMode.COLOR
        )

        // this.edgesTextureEffect = new TextureEffect({
        //   blendFunction: BlendFunction.SKIP,
        //   texture: this.smaaEffect.renderTargetEdges.texture
        // })

        // this.weightsTextureEffect = new TextureEffect({
        //   blendFunction: BlendFunction.SKIP,
        //   texture: this.smaaEffect.renderTargetWeights.texture
        // })

        this.initGUI()

        resolve({
          smaaEffect: this.smaaEffect
          // edgesTextureEffect: this.edgesTextureEffect,
          // weightsTextureEffect: this.weightsTextureEffect
        })
      })
    })
  }

  load() {
    this.loadingManager = new THREE.LoadingManager()
    this.assets = new Map()

    const smaaImageLoader = new SMAAImageLoader(this.loadingManager)
    return new Promise((resolve, reject) => {
      if (this.assets.size === 0) {
        this.loadingManager.onLoad = resolve
        // loadingManager.onProgress = ProgressManager.updateProgress
        this.loadingManager.onError = reject

        smaaImageLoader.load(([search, area]) => {
          this.assets.set('smaa-search', search)
          this.assets.set('smaa-area', area)
        })
      } else {
        resolve()
      }
    })
  }

  initGUI() {
    const gui = useGUI()
    const antialising = gui.postprocessing._addFolder('Antialiasing')

    const effectPass = this.effectPass

    const smaaEffect = this.smaaEffect
    // const edgesTextureEffect = this.edgesTextureEffect
    // const weightsTextureEffect = this.weightsTextureEffect
    const edgeDetectionMaterial = smaaEffect.edgeDetectionMaterial

    const SMAAMode = {
      DEFAULT: 0,
      SMAA_EDGES: 1,
      SMAA_WEIGHTS: 2
    }

    const params = {
      smaa: {
        mode: SMAAMode.DEFAULT,
        preset: SMAAPreset.HIGH,
        'edge detection': EdgeDetectionMode.DEPTH,
        'contrast factor': Number(
          edgeDetectionMaterial.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR
        ),
        opacity: smaaEffect.blendMode.opacity.value,
        'blend mode': smaaEffect.blendMode.blendFunction
      }
    }

    // antialising.add(params.smaa, 'mode', SMAAMode).onChange(() => {
    //   const mode = Number(params.smaa.mode)

    //   edgesTextureEffect.blendMode.blendFunction =
    //     mode === SMAAMode.SMAA_EDGES ? BlendFunction.NORMAL : BlendFunction.SKIP
    //   weightsTextureEffect.blendMode.blendFunction =
    //     mode === SMAAMode.SMAA_WEIGHTS
    //       ? BlendFunction.NORMAL
    //       : BlendFunction.SKIP
    //   effectPass.encodeOutput =
    //     mode !== SMAAMode.SMAA_EDGES && mode !== SMAAMode.SMAA_WEIGHTS
    //   effectPass.recompile()
    // })

    antialising.add(params.smaa, 'preset', SMAAPreset).onChange(() => {
      smaaEffect.applyPreset(Number(params.smaa.preset))
    })

    antialising
      .add(params.smaa, 'edge detection', EdgeDetectionMode)
      .onChange(() => {
        edgeDetectionMaterial.setEdgeDetectionMode(
          Number(params.smaa['edge detection'])
        )
      })

    antialising
      .add(params.smaa, 'contrast factor')
      .min(1.0)
      .max(3.0)
      .step(0.01)
      .onChange(() => {
        edgeDetectionMaterial.setLocalContrastAdaptationFactor(
          Number(params.smaa['contrast factor'])
        )
      })

    antialising
      .add(params.smaa, 'opacity')
      .min(0.0)
      .max(1.0)
      .step(0.01)
      .onChange(() => {
        smaaEffect.blendMode.opacity.value = params.smaa.opacity
      })

    antialising.add(params.smaa, 'blend mode', BlendFunction).onChange(() => {
      smaaEffect.blendMode.blendFunction = Number(params.smaa['blend mode'])
      effectPass.recompile()
    })
  }
}
