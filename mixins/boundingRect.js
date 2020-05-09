import { mapState } from 'vuex'

export default {
  data() {
    return {
      boundingRect: undefined,
      initialScroll: { x: 0, y: 0 }
    }
  },
  computed: {
    ...mapState({
      scrollPosition: (state) => state.scroll.position
    })
  },
  mounted() {
    this.updateBoundingRect()

    this.$viewport.events.on('resize', this.updateBoundingRect)
    this.$events.on('RESIZE', this.updateBoundingRect)
  },
  beforeDestroy() {
    this.$viewport.events.off('resize', this.updateBoundingRect)
    this.$events.off('RESIZE', this.updateBoundingRect)
  },
  methods: {
    updateBoundingRect() {
      this.initialScroll = { ...this.scrollPosition }
      this.boundingRect = this.$el.getBoundingClientRect()
    }
  }
}
