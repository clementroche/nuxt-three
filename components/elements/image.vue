<template>
  <picture
    :style="aspectRatio ? { '--aspect-ratio': aspectRatio } : {}"
    :class="{ 'image--loaded': !!currentSrc }"
    class="image"
  >
    <div
      v-observe-visibility="{
        callback: (isVisible) => {
          inView = isVisible
        },
        intersection: {
          threshold: 0
        },
        once: true
      }"
      class="image__trigger"
    />
    <source
      v-for="(source, i) in sources"
      :key="i"
      v-bind="inView ? { ...source } : {}"
    />
    <img
      ref="img"
      @load="onLoad"
      v-bind="inView || !lazyLoad ? { ...$attrs, ...{ src: src } } : {}"
      :style="{ 'object-fit': objectFit }"
    />
  </picture>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    sources: {
      type: Array,
      default: () => []
    },
    src: {
      type: String,
      default: ''
    },
    aspectRatio: {
      type: Number,
      default: undefined
    },
    objectFit: {
      type: String,
      default: 'cover'
    },
    lazyLoad: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      currentSrc: undefined,
      inView: false
    }
  },
  watch: {
    currentSrc() {
      this.$emit('load', this.currentSrc)
    }
  },
  methods: {
    onLoad() {
      if (!this.$refs.img) return
      this.currentSrc = this.$refs.img.currentSrc
    }
  }
}
</script>

<style lang="scss">
.image {
  display: block;
  opacity: 0;
  position: relative;
  transition: opacity 1s var(--ease-out-quint);

  &--loaded {
    opacity: 1;
  }

  img {
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }

  source {
    display: none;
  }

  &__trigger {
    height: calc(100% + 3000px);
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    visibility: hidden;
    width: calc(100% + 3000px);
  }
}
</style>
