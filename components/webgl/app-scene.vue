<template>
  <div>
    <canvas id="appScene" ref="appScene" />
  </div>
</template>

<script>
export default {
  mounted() {
    if (!this.$getWebGL()) {
      this.$createWebGL(this.$refs.appScene)
      this.$getWebGL().init()
    }
  },
  beforeDestroy() {
    this.$destroyWebGL()
  }
}
</script>

<style lang="scss">
#appScene {
  height: 100%;
  left: 0;
  // pointer-events: none;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: -1;
}
</style>
