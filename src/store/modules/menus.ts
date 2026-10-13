import type { Module } from 'vuex'
import type { RootState } from '..'
export interface Menu { id?: number; name: string; title: string; path: string; component?: string; icon?: string; children?: Menu[] }
export interface Tab { title: string; name: string }
export interface MenuState { menuList: Menu[]; permList: string[]; hasRoutes: boolean; editableTabsValue: string; editableTabs: Tab[] }
const initialState = (): MenuState => ({ menuList: [], permList: [], hasRoutes: false, editableTabsValue: 'Index', editableTabs: [{ title: '首页', name: 'Index' }] })
const menus: Module<MenuState, RootState> = {
  state: initialState,
  mutations: {
    setMenuList(state, menus: Menu[]) { state.menuList = menus },
    setPermList(state, perms: string[]) { state.permList = perms },
    changeRouteStatus(state, status: boolean) { state.hasRoutes = status },
    addTab(state, tab: Tab) { if (!state.editableTabs.some(t => t.name === tab.name)) state.editableTabs.push(tab); state.editableTabsValue = tab.name },
    resetState(state) { Object.assign(state, initialState()) }
  }
}
export default menus
