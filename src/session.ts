import store from './store'
/** Dynamic router import avoids the router → HTTP client dependency cycle. */
export async function clearSession() {
  store.commit('SET_TOKEN', '')
  store.commit('resetState')
  const { default: router, resetRoutes } = await import('./router')
  resetRoutes()
  if (router.currentRoute.value.path !== '/login') await router.replace('/login')
}
