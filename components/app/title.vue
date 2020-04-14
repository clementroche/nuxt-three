<template>
  <div class="appTitle">
    <webgl-text :text="'nuxt-three'" :fontSize="'14vw'" :tag="'h1'" />
  </div>
</template>

<script>
import WebglText from '@/components/webgl/text'

export default {
  components: {
    WebglText
  }
}
</script>

<style lang="scss">
.appTitle {
  display: flex;
  justify-content: center;
}
</style>
