<template>
  <e-image
    @load="
      (src) => {
        $emit('load', src)
        currentSrc = src
      }
    "
    v-bind="$attrs"
    class="webglImage"
  />
</template>

<script>
import gsap from '@/libs/gsap-bonus'
import useWebGL from '@/hooks/use-webgl'
import boundingRect from '@/mixins/bounding-rect'
import viewportResize from '@/mixins/viewport-resize'
import scroll from '@/mixins/scroll'
import frame from '@/mixins/frame'
import vertexShader from '@/webgl/shaders/images/vertex.glsl'
import fragmentShader from '@/webgl/shaders/images/fragment.glsl'

export default {
  mixins: [boundingRect, scroll, viewportResize, frame],
  inheritAttrs: false,
  props: {
    objectFit: {
      type: String,
      default: 'cover'
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
    }
  },
  data() {
    return {
      loaded: false,
      currentSrc: false
    }
  },
  watch: {
    async currentSrc() {
      if (this.preventTexture) return
      const texture = await this.loadTexture(this.currentSrc)

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

      this.loaded = true
    },
    loaded() {
      gsap.to(this.material.uniforms.uOpacity, {
        value: 1,
        duration: 1,
        ease: 'expo.out'
      })
    }
  },
  mounted() {
    this.initMesh()

    const { DOMScene } = useWebGL()
    DOMScene.add(this.mesh)

    this.positionate()
    this.resize()
  },
  async beforeDestroy() {
    if (this.preventDestroy) return

    await gsap.to(this.material.uniforms.uOpacity, {
      value: 0,
      duration: 0.5,
      ease: 'expo.out'
    })

    this.destroy()
  },
  methods: {
    onViewportResize() {
      this.positionate()
      this.resize()
    },
    destroy() {
      const { DOMScene } = useWebGL()
      DOMScene.remove(this.mesh)
    },
    loadTexture(src) {
      const loader = new THREE.TextureLoader()
      return new Promise((resolve, reject) => {
        loader.load(
          src,
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
            value: null
          },
          uRatio: {
            value: new THREE.Vector2()
          },
          uOpacity: {
            value: 0
          },
          ...this.uniforms
        },
        vertexShader: this.vertexShader ? this.vertexShader : vertexShader,
        fragmentShader: this.fragmentShader
          ? this.fragmentShader
          : fragmentShader,
        // defines: this.defines,
        transparent: true
      })
      this.mesh = new THREE.Mesh(this.geometry, this.material)
    },
    positionate() {
      if (this.preventPosition) return
      const elementCenterX = this.boundingRect.width / 2
      const elementCenterY = this.boundingRect.height / 2
      const elementX = this.boundingRect.left + this.scrollInitialPosition.x
      const elementY = this.boundingRect.top + this.scrollInitialPosition.y
      const x = -this.$viewport.width / 2 + elementX + elementCenterX
      const y = this.$viewport.height / 2 - elementY - elementCenterY
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
  opacity: 0 !important;
}
</style>
