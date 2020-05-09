<template>
  <div class="appIndex">
    <!-- <app-title /> -->
    <scroller :draggable="true">
      <div class="appIndex__images">
        <a
          v-for="({ src, size, url }, index) in images"
          :key="index"
          :style="{
            '--aspect-ratio': size[0] / size[1]
          }"
          :href="url"
          @dragstart.prevent=""
          class="appIndex__images__image"
          target="_blank"
          rel="noopener noreferrer"
          draggable="false"
        >
          <webgl-image :src="src" />
        </a>
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
          src:
            'https://images.unsplash.com/photo-1589017243109-8c5a7eae105c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
          size: [500, 658],
          url: 'https://unsplash.com/photos/x1fb9pYxLhc'
        },
        {
          src:
            'https://images.unsplash.com/photo-1588952935630-aae2fe13e9c7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1268&q=80',
          size: [1268, 949],
          url: 'https://unsplash.com/photos/U_a3rB-lR0c'
        },
        {
          src:
            'https://images.unsplash.com/photo-1587408811730-1a978e6c407d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=631&q=80',
          size: [631, 954],
          url: 'https://unsplash.com/photos/ypsFFH-XRv0'
        },
        {
          src:
            'https://images.unsplash.com/photo-1588815379841-181f8e458f88?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
          size: [1500, 1001],
          url: 'https://unsplash.com/photos/q82LRv-lWbA'
        },
        {
          src:
            'https://images.unsplash.com/photo-1588817457154-b7a8a751afc2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
          size: [634, 950],
          url: 'https://unsplash.com/photos/ONAAeKbf96U'
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
  cursor: grab;

  &__images {
    align-items: center;
    display: flex;
    flex-direction: column;
    margin: auto;
    padding-bottom: 50vh;
    padding-top: 50vh;
    width: 100%;
    width: 50vw;

    &__image {
      margin-bottom: 24px;
      width: 100%;
    }
  }
}
</style>
