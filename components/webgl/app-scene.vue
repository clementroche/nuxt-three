<template>
  <canvas id="appScene" ref="appScene" />
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
  height: 100% !important;
  left: 0;
  // pointer-events: none;
  position: fixed;
  top: 0;
  width: 100% !important;
  z-index: -1;
}
</style>
