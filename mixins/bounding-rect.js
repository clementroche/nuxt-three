export default {
  data() {
    return {
      boundingRect: undefined
    }
  },
  mounted() {
    this.updateBoundingRect()

    this.$viewport.events.on('resize', this.updateBoundingRect)
  },
  beforeDestroy() {
    this.$viewport.events.off('resize', this.updateBoundingRect)
  },
  methods: {
    updateBoundingRect() {
      this.boundingRect = this.$el.getBoundingClientRect()
    }
  }
}
