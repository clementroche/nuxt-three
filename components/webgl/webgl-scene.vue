<template>
  <div id="appScene">
    <webgl-info />
  </div>
</template>

<script>
import gsap from 'gsap'

import useWebGL from '@/hooks/use-webgl'
import useRAF from '@/hooks/use-raf'
import useGUI from '@/hooks/use-gui'

import WebglInfo from '@/components/webgl/webgl-info'

export default {
  components: {
    WebglInfo
  },
  data() {
    return {
      mouse: new THREE.Vector2()
    }
  },
  watch: {
    '$mouse.normalized': {
      handler() {
        const { x, y } = this.$mouse.normalized
        gsap.to(this.mouse, {
          ease: 'expo.out',
          duration: 2,
          x,
          y
        })
      },
      deep: true
    }
  },
  mounted() {
    const { canvas } = useWebGL()
    this.$el.appendChild(canvas)

    this.init()
  },
  beforeDestroy() {
    const RAF = useRAF()
    RAF.remove('scene')

    const webGL = useWebGL()
    webGL.destroy()

    const GUI = useGUI()
    GUI.destroy()
  },
  methods: {
    init() {
      const { DOMScene } = useWebGL()
      const RAF = useRAF()

      DOMScene.scale.setScalar(250)
      this.addBox()

      RAF.add('scene', this.loop, 0)
    },
    addBox() {
      const { raycaster } = useWebGL()

      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshNormalMaterial()
      this.cube = new THREE.Mesh(geometry, material)

      const { DOMScene } = useWebGL()
      DOMScene.add(this.cube)

      raycaster.addTarget(this.cube)

      raycaster.events.on('mousemove', (intersections) => {
        const cubeIsIntersected = intersections.some(
          (intersection) => intersection.object.uuid === this.cube.uuid
        )

        const scale = cubeIsIntersected ? 1.1 : 1

        gsap.to(this.cube.scale, {
          duration: 2,
          ease: 'expo.out',
          x: scale,
          y: scale
        })
      })
    },
    loop() {
      this.cube.rotation.x = -this.mouse.y * 0.1
      this.cube.rotation.y = this.mouse.x * 0.1
    }
  }
}
</script>

<style lang="scss">
#appScene {
  height: 100% !important;
  left: 0;
  // pointer-events: none;
  position: fixed;
  top: 0;
  width: 100% !important;
  z-index: -1;

  canvas {
    height: 100% !important;
    width: 100% !important;
  }
}
</style>
