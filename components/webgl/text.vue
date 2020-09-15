<template>
  <component
    ref="text"
    :is="tag"
    :class="{ 'webglText--loaded': loaded }"
    :style="{
      'font-size': fontSize,
      'font-family': fontFamily,
      color,
      '-webkit-text-stroke-width': strokeWidth + 'px',
      '-webkit-text-stroke-color': strokeColor
    }"
    class="webglText"
  >
    {{ text }}
  </component>
</template>

<script>
import useWebgl from '@/hooks/use-webgl'
import useRAF from '@/hooks/use-raf'

export default {
  props: {
    tag: {
      type: String,
      default: 'div'
    },
    text: {
      type: String,
      default: ''
    },
    fontSize: {
      type: String,
      default: '14px'
    },
    fontFamily: {
      type: String,
      default: 'sans-serif'
    },
    color: {
      type: String,
      default: 'white'
    },
    strokeColor: {
      type: String,
      default: 'white'
    },
    strokeWidth: {
      type: Number,
      default: 0
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loaded: false
    }
  },
  mounted() {
    this.init()

    this.loaded = true

    this.onWindowResize()

    this.$viewport.events.on('resize', this.onWindowResize)
  },
  updated() {
    if (this.enabled) {
      this.drawText()
    }
  },
  beforeDestroy() {
    const { scene } = useWebgl()
    scene.remove(this.webglWrapper)
  },
  methods: {
    updateBoundingRect() {
      this.boundingRect = this.$refs.text.getBoundingClientRect()
    },
    computePosition() {
      const elementCenterX = this.boundingRect.width / 2
      const elementCenterY = this.boundingRect.height / 2
      const elementX = this.boundingRect.left
      const elementY = this.boundingRect.top

      return {
        x: -this.$viewport.width / 2 + elementX + elementCenterX,
        y: this.$viewport.height / 2 - elementY - elementCenterY
      }
    },
    update() {
      const { x, y } = this.computePosition()
      this.webglWrapper.position.set(x, y, 0)

      if (this.boundingRect.width !== 0 && this.boundingRect.height !== 0) {
        this.mesh.scale.set(
          this.boundingRect.width,
          this.boundingRect.height,
          1
        )
      }
    },
    onWindowResize() {
      this.updateBoundingRect()
      if (this.enabled) {
        this.drawText()
      }
    },
    init() {
      if (this.enabled) {
        this.initCanvas()
        this.initMesh()

        const RAF = useRAF()
        RAF.add(this.mesh.uuid, this.update, 0)
      }
    },
    initCanvas() {
      this.canvas = document.createElement('canvas')
      this.context = this.canvas.getContext('2d')
    },
    initMesh() {
      this.webglWrapper = new THREE.Group()

      this.texture = new THREE.CanvasTexture(this.canvas)
      this.material = new THREE.SpriteMaterial({ map: this.texture })
      this.mesh = new THREE.Sprite(this.material)

      this.webglWrapper.add(this.mesh)

      const { scene } = useWebgl()
      scene.add(this.webglWrapper)
    },
    drawText() {
      this.context.canvas.width = this.boundingRect.width
      this.context.canvas.height = this.boundingRect.height

      this.context.font = `${this.canvas.height}px ${this.fontFamily}`
      this.context.textBaseline = 'top'
      this.context.fillStyle = this.color
      this.context.fillText(this.text, 0, this.canvas.height * 0.1)

      if (this.strokeWidth > 0) {
        this.context.lineWidth = this.strokeWidth
        this.context.strokeStyle = this.strokeColor
        this.context.strokeText(this.text, 0, this.canvas.height * 0.1)
      }

      this.texture.needsUpdate = true
    }
  }
}
</script>

<style lang="scss">
.webglText {
  &--loaded {
    opacity: 0;
  }
}
</style>
