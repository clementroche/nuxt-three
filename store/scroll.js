export const strict = false

export const state = () => ({
  position: { x: 0, y: 0 },
  progress: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 }
})

export const mutations = {
  setPosition(state, position) {
    state.position = position
  },
  setProgress(state, progress) {
    state.progress = progress
  },
  setVelocity(state, velocity) {
    state.velocity = velocity
  },
  reset(state) {
    state.position = { x: 0, y: 0 }
    state.progress = { x: 0, y: 0 }
    state.velocity = { x: 0, y: 0 }
  }
}

export const getters = {}

export const actions = {}
