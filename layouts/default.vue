<template>
  <div>
    <nuxt />
    <appScene />
  </div>
</template>

<script>
import appScene from '@/components/webgl/app-scene'
export default {
  components: {
    appScene
  }
}
</script>

<style lang="scss">
#__nuxt {
  min-height: 100%;
  overflow-y: auto;
}
</style>
