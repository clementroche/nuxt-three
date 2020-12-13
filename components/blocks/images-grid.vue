<template>
  <section class="imagesGrid">
    <div v-for="(imgs, i) in columns" :key="i" class="imagesGrid__column">
      <a
        v-for="({ src, size, url }, index) in imgs"
        :key="index"
        :href="url"
        @dragstart.prevent=""
        class="imagesGrid__image"
        target="_blank"
        rel="noopener noreferrer"
        draggable="false"
      >
        <webgl-image
          :small="src"
          :large="src"
          :native="false"
          :aspectRatio="size[0] / size[1]"
        />
      </a>
    </div>
  </section>
</template>

<script>
import viewportResize from '@/mixins/viewport-resize'

export default {
  mixins: [viewportResize],
  data() {
    return {
      webglEnabled: true,
      images: [
        {
          src:
            'https://images.unsplash.com/photo-1589017243109-8c5a7eae105c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80',
          size: [500, 658],
          url: 'https://unsplash.com/photos/x1fb9pYxLhc'
        },
        {
          src:
            'https://images.unsplash.com/photo-1588952935630-aae2fe13e9c7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80',
          size: [1268, 949],
          url: 'https://unsplash.com/photos/U_a3rB-lR0c'
        },
        {
          src:
            'https://images.unsplash.com/photo-1587408811730-1a978e6c407d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80',
          size: [631, 954],
          url: 'https://unsplash.com/photos/ypsFFH-XRv0'
        },
        {
          src:
            'https://images.unsplash.com/photo-1588815379841-181f8e458f88?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80',
          size: [1500, 1001],
          url: 'https://unsplash.com/photos/q82LRv-lWbA'
        },
        {
          src:
            'https://images.unsplash.com/photo-1588817457154-b7a8a751afc2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80',
          size: [634, 950],
          url: 'https://unsplash.com/photos/ONAAeKbf96U'
        },
        {
          src:
            'https://images.unsplash.com/photo-1589930360978-595586d19674?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80',
          size: [700, 393],
          url: 'https://unsplash.com/photos/gc6_5gsHcSA'
        },
        {
          src:
            'https://images.unsplash.com/photo-1590013330582-7b6927e75514?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80',
          size: [634, 951],
          url: 'https://unsplash.com/photos/VqET4JUmq_c'
        },
        {
          src:
            'https://images.unsplash.com/photo-1589967842752-690d7f63a8c1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80',
          size: [1268, 950],
          url: 'https://unsplash.com/photos/ZtlQjtbkBnU'
        },
        {
          src:
            'https://images.unsplash.com/photo-1589910381212-4848d2d1f7f0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80',
          size: [675, 900],
          url: 'https://unsplash.com/photos/Q1l1ofdVYl4'
        },
        {
          src:
            'https://images.unsplash.com/photo-1589877929074-9dd46c7e8cca?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80',
          size: [1350, 900],
          url: 'https://unsplash.com/photos/_QgWFOLX8Ks'
        }
      ]
    }
  },
  computed: {
    columns() {
      return [
        [...this.images].splice(0, 3),
        [...this.images].splice(3, 3),
        [...this.images].splice(6, 3)
      ]
    }
  },
  mounted() {
    this.webglEnabled = this.$viewport.width > 768
  },
  methods: {
    onViewportResize() {
      this.webglEnabled = this.$viewport.width > 768
    }
  }
}
</script>

<style lang="scss">
.imagesGrid {
  margin: auto;
  padding-bottom: 24px;
  @include media('>tablet') {
    display: flex;
    justify-content: center;
  }

  &__column {
    margin: auto;
    width: calc(100vw - 48px);
    @include media('>tablet') {
      margin: 0 24px;
      width: 25vw;
    }
  }

  &__image {
    display: block;
    margin-bottom: 24px;
    width: 100%;
  }
}
</style>
