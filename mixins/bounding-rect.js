export default {
  data() {
    return {
      boundingRect: undefined
    }
  },
  mounted() {
    this.updateBoundingRect()

    this.$events.on('viewport:resize', this.updateBoundingRect)
  },
  beforeDestroy() {
    this.$events.off('viewport:resize', this.updateBoundingRect)
  },
  methods: {
    updateBoundingRect() {
      this.boundingRect = this.$el.getBoundingClientRect()
    }
  }
}
