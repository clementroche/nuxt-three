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
      :src="inView ? src : ''"
      v-bind="inView ? $attrs : {}"
      :style="{ 'object-fit': objectFit }"
      :width="width"
      :height="height"
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
    width: {
      type: Number,
      default: 1
    },
    height: {
      type: Number,
      default: 1
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
      this.$emit('src', this.currentSrc)
    }
  },
  methods: {
    onLoad() {
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

  source {
    display: none;
  }

  &__trigger {
    height: calc(100% + 500px);
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    visibility: hidden;
    width: calc(100% + 10000px);
  }

  img {
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
}
</style>
