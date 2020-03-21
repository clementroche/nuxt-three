export default function({ store, app }) {
  // Si l'utilisateur n'est pas authentifié
  store.commit('setScrollY', 0)
  store.commit('setScrollVelocity', 0)
  if (app.$getScene) {
    app.$getScene().scene.position.y = 0
  }
}
