<template>
  <div class="appTitle">
    <h1 v-kinesis="{ depth: 50 }" class="appTitle__title">nuxt-three</h1>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import gsap from 'gsap'
import useWebGL from '@/hooks/use-webgl'
import useRAF from '@/hooks/use-raf'

const SCALE_OUT = 0.2
const SCALE_IN = 0.3

export default {
  data() {
    return {
      mouse: new THREE.Vector2(),
      hover: false,
      scale: undefined
    }
  },
  computed: {
    ...mapState({
      scrollPosition: (state) => state.scroll.position
    })
  },
  watch: {
    hover() {
      gsap.to(this, {
        duration: 2,
        ease: 'expo.out',
        scale: this.hover ? SCALE_IN : SCALE_OUT
      })
    },
    '$mouse.normalized': {
      handler() {
        const { x, y } = this.$mouse.normalized
        gsap.to(this.mouse, {
          ease: 'expo.out',
          duration: 1,
          x,
          y
        })
      },
      deep: true
    }
  },
  mounted() {
    this.scale = SCALE_OUT

    this.addBox()

    const RAF = useRAF()
    RAF.add('title', this.loop, 0)
  },
  beforeDestroy() {
    const RAF = useRAF()
    RAF.remove('title')

    const { DOMScene, raycaster } = useWebGL()
    DOMScene.remove(this.cube)

    raycaster.removeTarget(this.cube)

    raycaster.events.off('mousemove', this.onRaycast)
  },
  methods: {
    loop() {
      this.cube.scale.setScalar(this.$viewport.width * this.scale)

      this.cube.rotation.set(-this.mouse.y * 0.2, this.mouse.x * 0.2, 0)

      this.cube.position.y =
        -this.scrollPosition.y + this.$viewport.height * 0.05

      console.log(this.scrollPosition.y)
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
      this.cube.scale.setScalar(this.initialScale)

      const { DOMScene } = useWebGL()
      DOMScene.add(this.cube)

      raycaster.addTarget(this.cube)

      raycaster.events.on('mousemove', this.onRaycast)
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
    font-size: 10vw;
    letter-spacing: 2vw;
    text-align: center;
    -webkit-text-stroke: 1px transparent;
    text-transform: uppercase;
    transition-duration: 1s;
    transition-property: color, -webkit-text-stroke;
    transition-timing-function: var(--ease-out-quint);
    white-space: nowrap;

    @include media('>l') {
      font-size: 125px;
      letter-spacing: 20px;
    }

    @media (hover: hover) {
      &:hover {
        color: transparent;
        -webkit-text-stroke: 1px var(--c-white);
      }
    }
  }
}
</style>
