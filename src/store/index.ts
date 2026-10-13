import { createStore } from 'vuex'
import menus, { type MenuState } from './modules/menus'
export interface RootState { token: string; menus: MenuState }
export default createStore<RootState>({
  state: () => ({ token: localStorage.getItem('token') || '' } as RootState),
  mutations: { SET_TOKEN(state, token: string) { state.token = token; if (token) localStorage.setItem('token', token); else localStorage.removeItem('token') } },
  modules: { menus }
})
