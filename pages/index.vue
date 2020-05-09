<template>
  <div class="appIndex">
    <!-- <app-title /> -->
    <scroller>
      <div class="appIndex__images">
        <div
          v-for="({ src, size }, index) in images"
          :key="index"
          :style="{ '--aspect-ratio': size[0] / size[1] }"
          style="width: 50vw;"
          class="appIndex__images__image"
        >
          <webgl-image :src="src" />
        </div>
      </div>
    </scroller>
  </div>
</template>

<script>
import gsap from 'gsap'

import useWebGL from '@/hooks/use-webgl'
import useRAF from '@/hooks/use-raf'

// import AppTitle from '@/components/app/app-title'

export default {
  components: {
    // AppTitle
  },
  data() {
    return {
      mouse: new THREE.Vector2(),
      images: [
        {
          src: '/images/analia-ferrario.jpg',
          size: [1152, 864]
        },
        {
          src: '/images/andres-dallimonti.jpg',
          size: [864, 1296]
        }
      ]
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
    this.init()
  },
  beforeDestroy() {
    const RAF = useRAF()
    RAF.remove('index')
  },
  methods: {
    init() {
      // this.addBox()

      const RAF = useRAF()
      RAF.add('index', this.loop, 0)
    },
    addBox() {
      const { raycaster } = useWebGL()

      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshNormalMaterial()
      this.cube = new THREE.Mesh(geometry, material)
      this.cube.scale.setScalar(250)

      const { DOMScene } = useWebGL()
      DOMScene.add(this.cube)

      raycaster.addTarget(this.cube)

      raycaster.events.on('mousemove', (intersections) => {
        const cubeIsIntersected = intersections.some(
          (intersection) => intersection.object.uuid === this.cube.uuid
        )

        const scale = cubeIsIntersected ? 375 : 250

        gsap.to(this.cube.scale, {
          duration: 2,
          ease: 'expo.out',
          x: scale,
          y: scale
        })
      })
    },
    loop() {
      // this.cube.rotation.x = -this.mouse.y * 0.1
      // this.cube.rotation.y = this.mouse.x * 0.1
    }
  }
}
</script>

<style lang="scss">
.appIndex {
  &__images {
    align-items: center;
    display: flex;
    flex-direction: column;
    padding-bottom: 50vh;
    padding-top: 50vh;
    width: 100%;

    &__image {
      margin-bottom: 24px;
    }
  }
}
</style>
