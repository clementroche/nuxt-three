<template>
  <div>
    <nuxt />
    <webgl-scene />
  </div>
</template>

<script>
import WebglScene from '@/components/webgl/webgl-scene'

export default {
  components: {
    WebglScene
  }
}
</script>

<style lang="scss">
#__nuxt {
  min-height: 100%;
  overflow-y: auto;
}
</style>
