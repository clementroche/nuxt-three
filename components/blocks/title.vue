<template>
  <div class="appTitle">
    <h1 v-kinesis="{ depth: 10 }" class="appTitle__title">nuxt-three</h1>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import gsap from '@/libs/gsap-bonus'
import useWebGL from '@/hooks/use-webgl'
// import useRAF from '@/hooks/use-raf'
import frame from '@/mixins/frame'

const SCALE_OUT = 1
const SCALE_IN = 1.5

export default {
  mixins: [frame],
  data() {
    return {
      // mouse: new THREE.Vector2(),
      hover: false
      // scale: undefined
    }
  },
  computed: {
    ...mapState({
      scrollPosition: (state) => state.scroll.position
    })
  },
  watch: {
    hover() {
      const scale = gsap.utils.clamp(200, 500, this.$viewport.width * 0.2)
      const scalar = this.hover ? scale * SCALE_IN : scale * SCALE_OUT

      gsap.to(this.cube.scale, {
        duration: 2,
        ease: 'expo.out',
        x: scalar,
        y: scalar,
        z: scalar
      })
    }
  },
  mounted() {
    this.scale = SCALE_OUT

    this.addBox()

    this.$events.on('raycaster:mousemove', this.onRaycast)

    // const RAF = useRAF()
    // RAF.add('title', this.loop, 0)
  },
  beforeDestroy() {
    // const RAF = useRAF()
    // RAF.remove('title')

    const { DOMScene, raycaster } = useWebGL()
    DOMScene.remove(this.cube)

    raycaster.removeTarget(this.cube)

    this.$events.off('raycaster:mousemove', this.onRaycast)
  },
  methods: {
    onFrame() {
      //   if (!this.$mouse.hasMoved) return
      //   this.cube.scale.setScalar(
      //     (this.$viewport.width <= 769
      //       ? this.$viewport.width * 2
      //       : this.$viewport.width) * this.scale
      //   )

      if (this.$mouse.hasMoved) {
        this.cube.rotation.set(
          this.$mouse.lerpedNormalized.y * 0.2,
          -this.$mouse.lerpedNormalized.x * 0.2,
          0
        )

        this.cube.position.set(
          this.$mouse.lerpedNormalized.x * 33,
          this.$mouse.lerpedNormalized.y * 33,
          0
        )
      }

      // this.cube.position.y =
      //   this.scrollPosition.y + this.$viewport.height * 0.05
    },
    onRaycast(intersections) {
      this.hover = intersections.some(
        (intersection) => intersection.object.uuid === this.cube.uuid
      )
    },
    addBox() {
      const { raycaster } = useWebGL()

      const geometry = new THREE.DodecahedronBufferGeometry(0.5, 0)
      const material = new THREE.MeshNormalMaterial()
      this.cube = new THREE.Mesh(geometry, material)
      this.cube.scale.setScalar(
        gsap.utils.clamp(200, 500, this.$viewport.width * 0.2)
      )

      const { DOMScene } = useWebGL()
      DOMScene.add(this.cube)

      raycaster.addTarget(this.cube)
    }
  }
}
</script>

<style lang="scss">
.appTitle {
  align-items: center;
  display: flex;
  height: 90vh;
  height: calc(var(--vh, 1vh) * 90);
  justify-content: center;

  &__title {
    color: var(--c-white);
    font-family: var(--font-gotham-ultra);
    font-size: clamp(24px, 10vw, 150px);
    letter-spacing: clamp(5px, 2vw, 30px);
    text-align: center;
    -webkit-text-stroke: 1px transparent;
    text-transform: uppercase;
    transition-duration: 1s;
    transition-property: color, -webkit-text-stroke;
    transition-timing-function: var(--ease-out-quint);
    white-space: nowrap;

    // @include media('>tablet') {
    //   font-size: 125px;
    //   letter-spacing: 20px;
    // }

    @include hover {
      &:hover {
        color: transparent;
        -webkit-text-stroke: 1px var(--c-white);
      }
    }
  }
}
</style>
