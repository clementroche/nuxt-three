<template>
  <div>
    <app-scrollbar id="appScrollbar" />
    <nuxt />
    <webgl-scene />
  </div>
</template>

<script>
export default {
  components: {
    WebglScene: () => import('@/components/webgl/webgl-scene'),
    AppScrollbar: () => import('@/components/shell/app-scrollbar')
  }
}
</script>

<style lang="scss">
#__nuxt {
  height: 100%;
  overflow-y: auto;
}

#appScrollbar {
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
}
</style>
