<template>
  <div
    v-intersection-observer="{
      triggerOnce: true,
      onChange: (value) => {
        if (lazyload) {
          inView = value
        }
      }
    }"
    class="webglImage"
  >
    <img v-if="!enabled" :src="inView ? src : ''" />
  </div>
</template>

<script>
import useWebGL from '@/hooks/use-webgl'
import useRAF from '@/hooks/use-raf'

import boundingRect from '@/mixins/boundingRect'

import vertexShader from '@/webgl/shaders/images/vertex.glsl'
import fragmentShader from '@/webgl/shaders/images/fragment.glsl'

export default {
  mixins: [boundingRect],
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      required: true
    },
    fragmentShader: {
      type: String,
      default: ''
    },
    vertexShader: {
      type: String,
      default: ''
    },
    uniforms: {
      type: Object,
      default: () => ({})
    },
    defines: {
      type: Object,
      default: () => ({})
    },
    lazyload: {
      type: Boolean,
      default: false
    },
    objectFit: {
      type: String,
      default: 'cover'
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return { inView: undefined }
  },
  watch: {
    inView() {
      if (this.inView) this.initTexture()
    },
    enabled() {
      this.webglWrapper.visible = this.enabled
    }
  },
  mounted() {
    if (!this.lazyload) this.inView = true

    this.webglWrapper = new THREE.Group()
    this.webglWrapper.visible = this.enabled
    this.initMesh()

    const { DOMScene } = useWebGL()
    DOMScene.add(this.webglWrapper)

    const RAF = useRAF()
    RAF.add(this.webglWrapper.uuid, this.update, 0)
  },
  beforeDestroy() {
    const { DOMScene } = useWebGL()
    DOMScene.remove(this.webglWrapper)

    this.geometry.dispose()
    this.material.dispose()
    if (this.texture) {
      this.texture.dispose()
    }

    const RAF = useRAF()
    RAF.remove(this.webglWrapper.uuid)
  },
  methods: {
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
    async initTexture() {
      this.texture = await this.loadTexture()
      this.texture.needsUpdate = true
      this.texture.wrapS = THREE.ClampToEdgeWrapping
      this.texture.wrapT = THREE.ClampToEdgeWrapping
      // this.texture.minFilter = THREE.NearestFilter
      // this.texture.magFilter = THREE.LinearFilter

      this.material.uniforms.uMap.value = this.texture
      this.naturalRatio =
        this.texture.image.naturalWidth / this.texture.image.naturalHeight

      requestAnimationFrame(() => {
        this.$emit('load')
      }, 0)
    },
    computeRatio() {
      this.ratio = this.boundingRect.width / this.boundingRect.height

      let width
      if (this.objectFit === 'contain') {
        width =
          this.ratio > this.naturalRatio
            ? this.boundingRect.height * this.naturalRatio
            : this.boundingRect.width
      } else {
        width =
          this.ratio > this.naturalRatio
            ? this.boundingRect.width
            : this.boundingRect.height * this.naturalRatio
      }
      const height = width / this.naturalRatio
      this.material.uniforms.uRatio.value.set(
        this.boundingRect.width / width,
        this.boundingRect.height / height
      )
    },
    initMesh() {
      this.geometry = new THREE.PlaneBufferGeometry(1, 1)
      this.material = new THREE.ShaderMaterial({
        uniforms: {
          uMap: {
            value: this.texture || null
          },
          uRatio: {
            value: new THREE.Vector2()
          },
          ...this.uniforms
        },
        vertexShader: this.vertexShader ? this.vertexShader : vertexShader,
        fragmentShader: this.fragmentShader
          ? this.fragmentShader
          : fragmentShader,
        defines: this.defines,
        transparent: true
      })

      this.mesh = new THREE.Mesh(this.geometry, this.material)

      this.webglWrapper.add(this.mesh)
    },
    computePosition() {
      const elementCenterX = this.boundingRect.width / 2
      const elementCenterY = this.boundingRect.height / 2
      const elementX = this.boundingRect.left - this.initialScroll.x
      const elementY = this.boundingRect.top - this.initialScroll.y

      return {
        x:
          -this.$viewport.width / 2 +
          elementX +
          elementCenterX +
          this.scrollPosition.x,
        y:
          this.$viewport.height / 2 -
          elementY -
          elementCenterY -
          this.scrollPosition.y +
          this.$scroll.scrollY
      }
    },
    update() {
      this.computeRatio()
      const { x, y } = this.computePosition()
      this.webglWrapper.position.set(x, y, 0)

      if (this.boundingRect.width !== 0 && this.boundingRect.height !== 0) {
        this.webglWrapper.scale.set(
          this.boundingRect.width,
          this.boundingRect.height,
          1
        )
      }
    }
  }
}
</script>

<style lang="scss">
.webglImage {
  display: block;
  height: 100%;
  position: relative;
  width: 100%;

  img {
    height: 100%;
    width: 100%;

    &[src=''] {
      visibility: hidden;
    }
  }
}
</style>
