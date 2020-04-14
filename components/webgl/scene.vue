<template>
  <div id="appScene">
    <webgl-info />
  </div>
</template>

<script>
import useWebGL from '@/hooks/use-webgl'

import WebglInfo from '@/components/webgl/info'

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
    const { destroy } = useWebGL()
    destroy()

    // this.$destroyWebgl()
  },
  methods: {
    init() {
      const { scene } = useWebGL()

      this.DOMScene = new THREE.Group()
      this.DOMScene.scale.setScalar(250)
      scene.add(this.DOMScene)
      this.addBox()
    },
    addBox() {
      const { raycaster } = useWebGL()

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
