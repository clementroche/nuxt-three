<template>
  <div id="appScene">
    <Info />
  </div>
</template>

<script>
import Info from '@/components/webgl/info'

export default {
  components: {
    Info
  },
  mounted() {
    const { canvas } = this.$useWebGL()
    this.$el.appendChild(canvas)

    this.init()
  },
  beforeDestroy() {
    const { destroy } = this.$useWebGL()
    destroy()
  },
  methods: {
    init() {
      const { scene } = this.$useWebGL()

      this.DOMScene = new THREE.Group()
      this.DOMScene.scale.setScalar(250)
      scene.add(this.DOMScene)
      this.initCamera()
      this.addBox()
    },
    initCamera() {
      const { scene, camera } = this.$useWebGL()

      camera.position.set(500, 500, 500)
      camera.lookAt(scene.position)
    },
    addBox() {
      const { raycaster } = this.$useWebGL()

      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshNormalMaterial()
      const cube = new THREE.Mesh(geometry, material)

      this.DOMScene.add(cube)

      raycaster.addTarget(cube)

      raycaster.events.on('intersection', (intersections) => {
        const cubeIsIntersected = intersections.filter(
          (intersection) => intersection.object.uuid === cube.uuid
        )

        if (cubeIsIntersected[0]) {
          cube.scale.setScalar(1.1)
        } else {
          cube.scale.setScalar(1)
        }
      })
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
