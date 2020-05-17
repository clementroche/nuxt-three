<template>
  <div>
    <app-scrollbar id="appScrollbar" />
    <nuxt />
    <webgl-scene />
  </div>
</template>

<script>
import WebglScene from '@/components/webgl/webgl-scene'
import AppScrollbar from '@/components/shell/app-scrollbar'

export default {
  components: {
    WebglScene,
    AppScrollbar
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
