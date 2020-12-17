import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      scrollInitialPosition: (state) => state.scroll.initialPosition,
      scrollPosition: (state) => state.scroll.position,
      scrollVelocity: (state) => state.scroll.velocity,
      scrollProgress: (state) => state.scroll.progress
    })
  }
}
