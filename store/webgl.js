export default {
  namespaced: true,
  state: {
    renderer: null
  },
  getters: {
    rendererCamera(state) {
      return state.renderer ? state.renderer.camera : null
    }
  },
  mutations: {
    setRenderer(state, renderer) {
      state.renderer = renderer
    }
  }
}
