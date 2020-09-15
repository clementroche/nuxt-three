<template>
  <!-- https://developer.mozilla.org/fr/docs/Apprendre/HTML/Comment/Ajouter_des_images_adaptatives_%C3%A0_une_page_web -->
  <picture
    v-intersection-observer="{
      onChange: (value) => {
        inView = value
      },
      threshold: 0.1,
      triggerOnce: true
    }"
    :class="{ 'image--visible': native && currentSrc }"
    :style="aspectRatio ? `--aspect-ratio:calc(${aspectRatio})` : ''"
    class="image"
  >
    <source
      :srcset="lazyloading ? (inViewLoad ? large : '') : large"
      media="(min-width: 769px)"
    />
    <!-- todo fallback https://stackoverflow.com/a/31186336 -->
    <img
      ref="image"
      :srcset="lazyloading ? (inViewLoad ? small : '') : small"
      :alt="alt"
      :style="`object-fit:${objectFit};`"
      @load="onLoad"
      draggable="false"
    />
    <div
      v-intersection-observer="{
        onChange: (value) => {
          inViewLoad = value
        },
        triggerOnce: true
      }"
      class="image__trigger"
    />
  </picture>
</template>

<script>
import gsap from 'gsap'

import useWebGL from '@/hooks/use-webgl'
import useRAF from '@/hooks/use-raf'

import boundingRect from '@/mixins/bounding-rect'

import vertexShader from '@/webgl/shaders/images/vertex.glsl'
import fragmentShader from '@/webgl/shaders/images/fragment.glsl'

export default {
  mixins: [boundingRect],
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
    alt: {
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
    appearAnimation: {
      type: Boolean,
      default: true
    },
    flowmap: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inView: false,
      inViewLoad: false,
      currentSrc: undefined,
      textureLoaded: false
    }
  },
  computed: {
    canAppear() {
      return this.inView && this.textureLoaded
    }
  },
  watch: {
    canAppear() {
      if (this.canAppear && this.appearAnimation) {
        gsap.to(this.material.uniforms.uOpacity, {
          duration: 0.6,
          value: 1,
          ease: 'expo.out'
        })
      }
    },
    currentSrc() {
      if (!this.native) this.initTexture()
    },
    native() {
      if (!this.native && !this.mesh) {
        this.init()
      } else if ((this.native && this.mesh) || (!this.mesh && this.native)) {
        this.mesh.visible = false
      } else if (this.mesh && !this.native) {
        this.mesh.visible = true
      }
    }
  },
  mounted() {
    if (!this.native) this.init()
  },
  beforeDestroy() {
    if (this.mesh) {
      const RAF = useRAF()
      RAF.remove(this.mesh.uuid)
    }

    if (this.preventDestroy) {
      return
    }

    if (this.texture) this.texture.dispose()
    if (this.mesh) {
      this.mesh.material.dispose()
      this.mesh.geometry.dispose()

      const { DOMScene, composer } = useWebGL()
      DOMScene.remove(this.mesh)

      if (this.flowmap) composer.mouseFlowmapEffect.deselectObject(this.mesh)
    }
  },
  methods: {
    init() {
      const { DOMScene, composer } = useWebGL()

      this.initMesh()
      DOMScene.add(this.mesh)

      if (this.flowmap) composer.mouseFlowmapEffect.selectObject(this.mesh)

      this.update()
      const RAF = useRAF()
      RAF.add(this.mesh.uuid, this.update, 0)
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
          uOpacity: {
            value: this.appearAnimation ? 0 : 1
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
    async initTexture() {
      this.texture = await this.loadTexture()
      this.texture.needsUpdate = true
      this.texture.wrapS = THREE.ClampToEdgeWrapping
      this.texture.wrapT = THREE.ClampToEdgeWrapping
      // this.texture.minFilter = THREE.NearestFilter
      // this.texture.magFilter = THREE.LinearFilter

      if (!this.delegateTexture) {
        this.material.uniforms.uMap.value = this.texture
        this.naturalRatio =
          this.texture.image.naturalWidth / this.texture.image.naturalHeight

        this.textureLoaded = true
      }
    },
    loadTexture() {
      const loader = new THREE.TextureLoader()

      return new Promise((resolve, reject) => {
        loader.load(
          this.currentSrc,
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
    onLoad() {
      this.currentSrc = this.$refs.image.currentSrc
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

      const ratio = new THREE.Vector2(
        this.boundingRect.width / width,
        this.boundingRect.height / height
      )

      if (!this.delegateRatio) {
        this.material.uniforms.uRatio.value.copy(ratio)
      }

      return ratio
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
          this.scrollPosition.y
      }
    },
    update() {
      this.computeRatio()
      const { x, y } = this.computePosition()
      this.mesh.position.set(x, y, 0)

      if (this.boundingRect.width !== 0 && this.boundingRect.height !== 0) {
        this.mesh.scale.set(
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
.image {
  display: inline-block;
  opacity: 0;
  // opacity: 0;
  // visibility: hidden;
  transition: opacity 400ms var(--ease-out-quint);
  // &--native {
  //   visibility: visible;
  // }

  &--visible {
    opacity: 1;
    // visibility: visible;
  }

  &__trigger {
    pointer-events: none;
  }

  img {
    height: 100%;
    width: 100%;
  }

  &[style*='--aspect-ratio'] {
    display: block;

    img {
      display: block;
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
    }
  }

  &__trigger {
    height: calc(100% + 500px);
    left: 0;
    position: absolute;
    top: 0;
    // transform: translate(-50%, -50%);
    transform: translateY(-250px);
    width: 100%;
  }
}
</style>
