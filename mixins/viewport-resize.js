export default {
  mounted() {
    if (this.onViewportResize)
      this.$viewport.events.on('resize', this.onViewportResize)
  },
  beforeDestroy() {
    if (this.onViewportResize)
      this.$viewport.events.off('resize', this.onViewportResize)
  }
}
