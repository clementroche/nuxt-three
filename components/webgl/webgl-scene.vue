<template>
  <div id="appScene">
    <webgl-info />
  </div>
</template>

<script>
import useWebGL from '@/hooks/use-webgl'
import useRAF from '@/hooks/use-raf'
import useGUI from '@/hooks/use-gui'

import WebglInfo from '@/components/webgl/webgl-info'

export default {
  components: {
    WebglInfo
  },
  mounted() {
    const { canvas } = useWebGL()
    this.$el.appendChild(canvas)

    this.init()
  },
  beforeDestroy() {
    const RAF = useRAF()
    RAF.remove('scene')

    useWebGL().destroy()
    useGUI().destroy()
  },
  computed: {
    mouse() {
      return this.$mouse.hasMove
        ? this.$mouse.lerpedNormalized
        : new THREE.Vector2(0, 0)
    }
  },
  methods: {
    init() {
      const { scene } = useWebGL()
      const RAF = useRAF()

      this.DOMScene = new THREE.Group()
      this.DOMScene.scale.setScalar(250)
      scene.add(this.DOMScene)
      this.addBox()

      RAF.add('scene', this.loop, 0)
    },
    addBox() {
      const { raycaster } = useWebGL()

      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshNormalMaterial()
      this.cube = new THREE.Mesh(geometry, material)

      this.DOMScene.add(this.cube)

      raycaster.addTarget(this.cube)

      raycaster.events.on('intersection', (intersections) => {
        const cubeIsIntersected = intersections.some(
          (intersection) => intersection.object.uuid === this.cube.uuid
        )

        if (cubeIsIntersected) {
          this.cube.scale.setScalar(1.1)
        } else {
          this.cube.scale.setScalar(1)
        }
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
