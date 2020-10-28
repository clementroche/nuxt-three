import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      initialScroll: (state) => state.scroll.initialPosition,
      scrollPosition: (state) => state.scroll.position
    })
  }
}
