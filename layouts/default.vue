<template>
  <div>
    <app-noise id="appNoise" />
    <app-scrollbar id="appScrollbar" v-if="$mq === 'desktop'" />
    <app-scroller>
      <nuxt />
    </app-scroller>
    <webgl-scene
      :style="`z-index:${$store.state.ui.glIndex === 'below' ? -1 : 0}`"
    />
  </div>
</template>

<script>
export default {
  scrollToTop: true,
  mounted() {
    window.scrollTo(0, 0)
    setTimeout(() => {
      this.$events.emit('viewport:resize')
    }, 0)
  }
}
</script>

<style lang="scss">
#__nuxt {
  height: 100%;
  overflow-y: auto;
}

#appNoise {
  height: 100%;
  left: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
}

#appScrollbar {
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 6;
}
</style>
