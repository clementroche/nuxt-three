<template>
  <div
    :style="aspectRatio ? `--aspect-ratio:${aspectRatio}` : ''"
    :class="{ 'webglImage--inView': toggleAppear }"
    class="webglImage"
  >
    <div
      v-observe-visibility="{
        callback: visibilityChanged,
        once: true
      }"
      class="webglImage__trigger"
    />
    <img
      v-if="native"
      :src="lazyloading ? (isVisible ? src : '') : src"
      alt=""
      draggable="false"
    />
  </div>
</template>

<script>
import gsap from 'gsap'
import useWebGL from '@/hooks/use-webgl'
import useRAF from '@/hooks/use-raf'
import boundingRect from '@/mixins/bounding-rect'
import scrollMixin from '@/mixins/scroll'
import vertexShader from '@/webgl/shaders/images/vertex.glsl'
import fragmentShader from '@/webgl/shaders/images/fragment.glsl'

export default {
  mixins: [boundingRect, scrollMixin],
  inheritAttrs: false,
  props: {
    small: {
      type: String,
      default: ''
    },
    large: {
      type: String,
      default: ''
    },
    aspectRatio: {
      type: Number,
      default: undefined
    },
    lazyloading: {
      type: Boolean,
      default: true
    },
    objectFit: {
      type: String,
      default: 'cover'
    },
    native: {
      type: Boolean,
      default: false
    },
    uniforms: {
      type: Object,
      default: () => ({})
    },
    vertexShader: {
      type: String,
      default: vertexShader
    },
    fragmentShader: {
      type: String,
      default: fragmentShader
    },
    geometryPrecision: {
      type: Number,
      default: 1
    },
    toggleAppear: {
      type: Boolean,
      default: true
    },
    appearDelay: {
      type: Number,
      default: 0
    },
    flowmap: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isVisible: undefined,
      loaded: false
    }
  },
  computed: {
    shouldAppear() {
      return this.loaded && this.toggleAppear
    },
    src() {
      let src
      if (this.$mq === 'mobile') {
        src = this.small
      } else if (this.$mq === 'desktop') {
        src = this.large
      }
      return src
    }
  },
  watch: {
    native() {
      if (!this.native && !this.mesh) this.initWebgl()
      this.mesh.visible = !this.native
    },
    async isVisible() {
      if (!this.isVisible) return
      if (!this.src) return
      if (!this.native) {
        await this.updateTexture()
      }
    },
    shouldAppear() {
      if (this.shouldAppear) {
        gsap.to(this.material.uniforms.uOpacity, {
          value: 1,
          duration: 1,
          delay: this.appearDelay,
          ease: 'expo.out'
        })
      }
    }
  },
  mounted() {
    if (!this.native) this.initWebgl()
  },
  beforeDestroy() {
    if (this.preventDestroy) return
    if (!this.mesh) return

    // await gsap.to(this.material.uniforms.uOpacity, {
    //   value: 0,
    //   duration: 0.5,
    //   ease: 'expo.out'
    // })

    this.destroy()
  },
  methods: {
    destroy() {
      const { DOMScene } = useWebGL()
      const RAF = useRAF()
      RAF.remove('image' + this.mesh.uuid)
      this.$viewport.events.off('resize', this.resize)
      DOMScene.remove(this.mesh)
    },
    visibilityChanged(isVisible, entry) {
      this.isVisible = isVisible
    },
    async updateTexture() {
      if (this.preventTexture) return
      const texture = await this.loadTexture()
      setTimeout(() => {
        this.loaded = true
      }, 0)

      texture.needsUpdate = true
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      if (this.material.uniforms.uMap.value) {
        this.material.uniforms.uMap.value.dispose()
      }
      this.material.uniforms.uMap.value = texture
      this.naturalRatio =
        texture.image.naturalWidth / texture.image.naturalHeight
      this.resize()
    },
    loadTexture() {
      const loader = new THREE.TextureLoader()
      return new Promise((resolve, reject) => {
        loader.load(
          this.src,
          (texture) => {
            resolve(texture)
          },
          undefined,
          (err) => {
            console.error('An error happened.', err)
          }
        )
      })
    },
    initWebgl() {
      // console.log('initwebgl')
      this.initMesh()
      if (this.isVisible && this.src) this.updateTexture()
      this.resize()
      this.loop()
      const { DOMScene, composer } = useWebGL()
      const RAF = useRAF()
      RAF.add('image' + this.mesh.uuid, this.loop, 0)
      this.$viewport.events.on('resize', this.resize)
      DOMScene.add(this.mesh)

      if (this.flowmap) composer.mouseFlowmapEffect.selectObject(this.mesh)
    },
    initMesh() {
      this.geometry = new THREE.PlaneBufferGeometry(
        1,
        1,
        this.geometryPrecision,
        this.geometryPrecision
      )

      this.material = new THREE.ShaderMaterial({
        uniforms: {
          uMap: {
            value: this.texture || null
          },
          uRatio: {
            value: new THREE.Vector2()
          },
          uOpacity: {
            value: this.toggleAppear + 0
          },
          ...this.uniforms
        },
        vertexShader: this.vertexShader,
        fragmentShader: this.fragmentShader,
        // defines: this.defines,
        transparent: true
      })
      this.mesh = new THREE.Mesh(this.geometry, this.material)
    },
    loop() {
      if (this.preventPosition) return
      const elementCenterX = this.boundingRect.width / 2
      const elementCenterY = this.boundingRect.height / 2
      const elementX = this.boundingRect.left - this.initialScroll.x
      const elementY = this.boundingRect.top + this.initialScroll.y
      const x =
        -this.$viewport.width / 2 +
        elementX +
        elementCenterX +
        this.scrollPosition.x +
        (this.deltaX || 0)
      const y =
        this.$viewport.height / 2 -
        elementY -
        elementCenterY +
        this.scrollPosition.y +
        (this.deltaY || 0)
      this.mesh.position.set(x, y, 0)
    },
    resize() {
      const meshRatio = this.boundingRect.width / this.boundingRect.height

      let width
      if (this.objectFit === 'contain') {
        width =
          meshRatio > this.naturalRatio
            ? this.boundingRect.height * this.naturalRatio
            : this.boundingRect.width
      } else {
        width =
          meshRatio > this.naturalRatio
            ? this.boundingRect.width
            : this.boundingRect.height * this.naturalRatio
      }
      const height = width / this.naturalRatio
      const ratio = new THREE.Vector2(
        this.boundingRect.width / width,
        this.boundingRect.height / height
      )

      if (!this.preventResize) {
        this.material.uniforms.uRatio.value.copy(ratio)
        // this.material.uniforms.uMeshRatio.value = meshRatio
        this.mesh.scale.set(
          this.boundingRect.width,
          this.boundingRect.height,
          1
        )
      }
      return ratio
    }
  }
}
</script>

<style lang="scss">
.webglImage {
  opacity: 0;
  position: relative;
  transition: opacity 1s var(--ease-out-quint);

  &--inView {
    opacity: 1;
  }

  &__trigger {
    height: calc(100% + 1000px);
    left: 50%;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% + 10000px);
  }

  img {
    display: block;
    height: 100%;
    left: 0;
    object-fit: cover;
    opacity: 1;
    position: absolute;
    top: 0;
    transition: opacity 1s var(--ease-out-quint);
    width: 100%;

    // img {
    //   height: 100%;
    //   width: 100%;

    &[src=''] {
      opacity: 0;
    }
    // }
  }
}
</style>
