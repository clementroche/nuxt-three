<template>
  <div class="pageIndex">
    <block-title />
    <!-- <block-images-grid class="appIndex__imagesGrid" /> -->
    <div class="pageIndex__image">
      <component
        :is="this.$mq === 'desktop' ? 'webgl-image' : 'native-image'"
        :sources="[
          {
            type: 'image/webp',
            srcset:
              '/images/webp/400w.webp 400w, /images/webp/800w.webp 800w, /images/webp/1200w.webp 1200w'
          },
          {
            type: 'image/jpeg',
            srcset:
              '/images/jpeg/400w.jpg 400w, /images/jpeg/800w.jpg 800w, /images/jpeg/1200w.jpg 1200w',
            sizes: '(max-width: 400px) 400px, (max-width: 769px) 769px'
          }
        ]"
        :src="'/images/webp/1200w.webp'"
        :aspectRatio="1200 / 1664"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import WebglImage from '@/components/webgl/image'
import NativeImage from '@/components/elements/image'

export default {
  components: {
    WebglImage,
    NativeImage
  }
}
</script>

<style lang="scss">
.pageIndex {
  &__image {
    margin: 0 auto;
    max-width: 1200px;
    // padding-bottom: 200vh;
    // padding-top: 200vh;
    width: 90vw;
  }
}
</style>
