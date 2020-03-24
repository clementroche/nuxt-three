<template>
  <div v-if="info" class="rendererInfo">
    <div>calls: {{ info.render.calls }}</div>
    <div>triangles: {{ info.render.triangles }}</div>
    <div>geometries: {{ info.memory.geometries }}</div>
    <div>textures: {{ info.memory.textures }}</div>
    <div>programs: {{ info.programs.length }}</div>
  </div>
</template>

<script>
import useWebGL from '@/hooks/use-webgl'

export default {
  data() {
    return {
      renderer: null,
      info: null
    }
  },
  watch: {
    'renderer.info.render.frame'() {
      this.info = this.renderer.info
    }
  },
  mounted() {
    const { renderer } = useWebGL()
    this.renderer = renderer
  }
}
</script>

<style lang="scss">
.rendererInfo {
  background: #000;
  bottom: 0;
  color: #fff;
  left: 0;
  opacity: 0.9;
  padding: 8px;
  position: fixed;
  z-index: 10000;
}
</style>
