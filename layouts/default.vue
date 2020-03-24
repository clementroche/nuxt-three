<template>
  <div>
    <nuxt />
    <Scene />
  </div>
</template>

<script>
import Scene from '@/components/webgl/scene'
export default {
  components: {
    Scene
  }
}
</script>

<style lang="scss">
#__nuxt {
  min-height: 100%;
  overflow-y: auto;
}
</style>
