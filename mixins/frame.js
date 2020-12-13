export default {
  mounted() {
    if (this.onBeforeFrame)
      this.$events.on('frame:beforeFrame', this.onBeforeFrame)
    if (this.onFrame) this.$events.on('frame:frame', this.onFrame)
    if (this.onAfterFrame)
      this.$events.on('frame:afterFrame', this.onAfterFrame)
    if (this.onAfterRender)
      this.$events.on('frame:afterRender', this.onAfterRender)
  },
  beforeDestroy() {
    if (this.onBeforeFrame)
      this.$events.off('frame:beforeFrame', this.onBeforeFrame)
    if (this.onFrame) this.$events.off('frame:frame', this.onFrame)
    if (this.onAfterFrame)
      this.$events.off('frame:afterFrame', this.onAfterFrame)
    if (this.onAfterRender)
      this.$events.off('frame:afterRender', this.onAfterRender)
  }
}
