<template>
  <picture
    :style="aspectRatio ? { '--aspect-ratio': aspectRatio } : {}"
    class="image"
  >
    <div
      v-show="!inView"
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
    visible: {
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
  methods: {
    onLoad() {
      this.currentSrc = this.$refs.img.currentSrc
    }
  },
  watch: {
    currentSrc() {
      this.$emit('src', this.currentSrc)
    }
  }
}
</script>

<style lang="scss">
.image {
  display: block;
  position: relative;

  source {
    display: none;
  }

  &__trigger {
    height: calc(100% + 1000px);
    left: 0;
    position: absolute;
    top: 0;
    transform: translateY(-500px);
    visibility: hidden;
    width: 100%;
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
