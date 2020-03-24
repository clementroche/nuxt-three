<template>
  <div id="appScene">
    <Info />
  </div>
</template>

<script>
import useWebGL from '@/hooks/use-webgl'

import Info from '@/components/webgl/info'

export default {
  components: {
    Info
  },
  mounted() {
    const { canvas } = useWebGL()
    this.$el.appendChild(canvas)

    this.$createWebgl()
  },
  beforeDestroy() {
    const { destroy } = useWebGL()
    destroy()

    this.$destroyWebgl()
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

  canvas {
    height: 100% !important;
    width: 100% !important;
  }
}
</style>
