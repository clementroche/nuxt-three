<template>
  <div v-if="rendererInfo" class="rendererInfo">
    <div>calls: {{ rendererInfo.render.calls }}</div>
    <div>triangles: {{ rendererInfo.render.triangles }}</div>
    <div>geometries: {{ rendererInfo.memory.geometries }}</div>
    <div>textures: {{ rendererInfo.memory.textures }}</div>
    <div>programs: {{ rendererInfo.programs.length }}</div>
  </div>
</template>

<script>
import useWebGL from '@/hooks/use-webgl'

export default {
  data() {
    return {
      rendererInfo: null
    }
  },
  mounted() {
    const { renderer } = useWebGL()
    this.rendererInfo = renderer.info
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
