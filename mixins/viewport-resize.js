export default {
  mounted() {
    if (this.onViewportResize)
      this.$events.on('viewport:resize', this.onViewportResize)
  },
  beforeDestroy() {
    if (this.onViewportResize)
      this.$events.off('viewport:resize', this.onViewportResize)
  }
}
