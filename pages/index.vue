<template>
  <div class="appIndex">
    <scroller :draggable="true" :native="$viewport.width <= 769">
      <app-title />
      <div class="appIndex__images">
        <a
          v-for="({ src, size, url }, index) in images"
          :key="index"
          :style="{
            '--aspect-ratio': size[0] / size[1]
          }"
          :href="url"
          @dragstart.prevent=""
          class="appIndex__images__image"
          target="_blank"
          rel="noopener noreferrer"
          draggable="false"
        >
          <webgl-image :src="src" :enabled="$viewport.width > 768" />
        </a>
      </div>
    </scroller>
  </div>
</template>

<script>
import useWebGL from '@/hooks/use-webgl'

import AppTitle from '@/components/blocks/app-title'

export default {
  components: {
    AppTitle
  },
  data() {
    return {
      images: [
        {
          src:
            'https://images.unsplash.com/photo-1589017243109-8c5a7eae105c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
          size: [500, 658],
          url: 'https://unsplash.com/photos/x1fb9pYxLhc'
        },
        {
          src:
            'https://images.unsplash.com/photo-1588952935630-aae2fe13e9c7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1268&q=80',
          size: [1268, 949],
          url: 'https://unsplash.com/photos/U_a3rB-lR0c'
        },
        {
          src:
            'https://images.unsplash.com/photo-1587408811730-1a978e6c407d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=631&q=80',
          size: [631, 954],
          url: 'https://unsplash.com/photos/ypsFFH-XRv0'
        },
        {
          src:
            'https://images.unsplash.com/photo-1588815379841-181f8e458f88?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
          size: [1500, 1001],
          url: 'https://unsplash.com/photos/q82LRv-lWbA'
        },
        {
          src:
            'https://images.unsplash.com/photo-1588817457154-b7a8a751afc2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
          size: [634, 950],
          url: 'https://unsplash.com/photos/ONAAeKbf96U'
        }
      ]
    }
  },
  mounted() {
    const { composer } = useWebGL()
    const { barrelEffect } = composer

    barrelEffect.uniforms.get('intensity').value = -0.1
  }
}
</script>

<style lang="scss">
.appIndex {
  cursor: grab;

  &__images {
    align-items: center;
    display: flex;
    flex-direction: column;
    margin: auto;
    padding-bottom: 10vh;
    padding-top: 90vh;
    width: 50vw;

    &__image {
      margin-bottom: 24px;
      width: 100%;
    }
  }
}
</style>
