<template>
  <div>
    <app-noise id="appNoise" />
    <app-scrollbar id="appScrollbar" />
    <nuxt />
    <webgl-scene />
  </div>
</template>

<script>
export default {
  components: {
    WebglScene: () => import('@/components/webgl/webgl-scene'),
    AppScrollbar: () => import('@/components/shell/app-scrollbar'),
    AppNoise: () => import('@/components/shell/app-noise')
  }
}
</script>

<style lang="scss">
#__nuxt {
  height: 100%;
  overflow-y: auto;
}

#appNoise {
  height: calc(var(--vh, 1vh) * 100);
  left: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 10;
}

#appScrollbar {
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
}
</style>
