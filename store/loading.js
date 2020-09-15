export const state = () => ({
  toLoad: undefined,
  loaded: undefined
})

export const mutations = {
  addToLoad(state) {
    if (state.toLoad === undefined) {
      state.toLoad = 0
    }
    state.toLoad++
  },
  addLoaded(state) {
    if (state.loaded === undefined) {
      state.loaded = 0
    }

    state.loaded++
  }
}

export const getters = {
  loaded: (state) => {
    return state.toLoad - state.loaded === 0 && state.toLoad !== undefined
  }
}

export const actions = {}
