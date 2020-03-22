import Vuex from 'vuex'

import webglStore from './webgl'

let store

const initStore = () => {
  return (
    store ||
    (store = new Vuex.Store({
      state: {},
      getters: {},
      mutations: {},
      actions: {},
      modules: { webgl: webglStore },
      strict: false
    }))
  )
}

export default initStore
