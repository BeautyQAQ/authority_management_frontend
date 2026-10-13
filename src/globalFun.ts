import store from './store'
export const hasAuth = (permission: string): boolean => store.state.menus.permList.includes(permission)
