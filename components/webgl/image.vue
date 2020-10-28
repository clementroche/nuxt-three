<template>
  <e-image
    @src="
      (src) => {
        currentSrc = src
      }
    "
    v-bind="$attrs"
    class="webglImage"
  />
</template>

<script>
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
    }
  },
  data() {
    return {
      currentSrc: false
    }
  },
  watch: {
    async currentSrc() {
      const texture = await this.loadTexture(this.currentSrc)
      this.loaded = true

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
    }
  },
  mounted() {
    this.initMesh()

    const { DOMScene } = useWebGL()
    DOMScene.add(this.mesh)

    const RAF = useRAF()
    this.loop()
    RAF.add('image' + this.mesh.uuid, this.loop, 0)

    this.resize()
    this.$viewport.events.on('resize', this.resize)
  },
  methods: {
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
      this.geometry = new THREE.PlaneBufferGeometry(1, 1)

      this.material = new THREE.ShaderMaterial({
        uniforms: {
          uMap: {
            value: null
          },
          uRatio: {
            value: new THREE.Vector2()
          },
          uOpacity: {
            value: 1
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
}
</style>
