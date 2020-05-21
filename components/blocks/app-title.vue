<template>
  <div class="appTitle">
    <!-- <webgl-text :text="'nuxt-three'" :fontSize="'14vw'" :tag="'h1'" /> -->
    <h1 class="appTitle__title">nuxt-three</h1>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import gsap from 'gsap'
import useWebGL from '@/hooks/use-webgl'
import useRAF from '@/hooks/use-raf'

export default {
  data() {
    return {
      mouse: new THREE.Vector2(),
      hover: false
    }
  },
  computed: {
    ...mapState({
      scrollPosition: (state) => state.scroll.position,
      initialScale() {
        return this.$viewport.width * 0.18
      },
      hoveredScale() {
        return this.$viewport.width * 0.22
      }
    })
  },
  watch: {
    hover() {
      const scale = this.hover ? this.hoveredScale : this.initialScale

      gsap.to(this.cube.scale, {
        duration: 2,
        ease: 'expo.out',
        x: scale,
        y: scale
      })
    },
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
    this.addBox()

    const RAF = useRAF()
    RAF.add('index', this.loop, 0)
  },
  beforeDestroy() {
    const RAF = useRAF()
    RAF.remove('index')

    const { DOMScene } = useWebGL()
    DOMScene.remove(this.cube)

    raycaster.removeTarget(this.cube)

    raycaster.events.off('mousemove', this.onRaycast)
  },
  methods: {
    loop() {
      this.cube.rotation.set(-this.mouse.y * 0.2, this.mouse.x * 0.2, 0)

      this.cube.position.y =
        -this.scrollPosition.y + this.$viewport.height * 0.05
    },
    onRaycast(intersections) {
      this.hover = intersections.some(
        (intersection) => intersection.object.uuid === this.cube.uuid
      )
    },
    addBox() {
      const { raycaster } = useWebGL()

      const geometry = new THREE.BoxGeometry(1, 1, 1)
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
  &__title {
    color: var(--color-white);
    font-family: var(--font-gotham-ultra);
    font-size: 10vw;
    left: 50%;
    letter-spacing: 2vw;
    position: absolute;
    text-align: center;
    -webkit-text-stroke: 0 var(--color-transparent);
    text-transform: uppercase;
    top: 45vh;
    transform: translateX(-50%) translateY(-50%);
    transition-duration: 1s;
    transition-property: color, -webkit-text-stroke;
    transition-timing-function: _ease('quint', 'out');
    white-space: nowrap;

    @include media('>l') {
      font-size: 125px;
      letter-spacing: 20px;
    }

    @media (hover: hover) {
      &:hover {
        color: var(--color-transparent);
        -webkit-text-stroke: 1px var(--color-white);
      }
    }
  }
}
</style>
