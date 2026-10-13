import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import request from '../axios'
import store from '../store'
import type { Menu } from '../store/modules/menus'
const pages = import.meta.glob('../views/sys/**/*.vue')
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes: [
  { path: '/', name: 'Home', component: Home, redirect: '/index', children: [
    { path: '/index', name: 'Index', meta: { title: '首页' }, component: () => import('../views/Index.vue') },
    { path: '/userCenter', name: 'UserCenter', meta: { title: '个人中心' }, component: () => import('../views/UserCenter.vue') }
  ] },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') }
] })
const removeRoutes: (() => void)[] = []
export function resetRoutes() { removeRoutes.splice(0).forEach(remove => remove()) }
function addMenuRoutes(menus: Menu[]) {
  for (const menu of menus) {
    const component = pages[`../views/${menu.component}.vue`]
    if (menu.component && Object.hasOwn(pages, `../views/${menu.component}.vue`) && !router.hasRoute(menu.name)) {
      removeRoutes.push(router.addRoute('Home', { path: menu.path, name: menu.name, component, meta: { title: menu.title, icon: menu.icon } } as RouteRecordRaw))
    }
    if (menu.children) addMenuRoutes(menu.children)
  }
}
router.beforeEach(async to => {
  if (to.path === '/login') return true
  if (!localStorage.getItem('token')) return '/login'
  if (!store.state.menus.hasRoutes) {
    try {
      const { data } = await request.get('/sys/menu/nav')
      resetRoutes()
      addMenuRoutes(data.data.nav)
      store.commit('setMenuList', data.data.nav)
      store.commit('setPermList', data.data.authoritys)
      store.commit('changeRouteStatus', true)
      return { path: to.fullPath, replace: true }
    } catch {
      store.commit('SET_TOKEN', '')
      store.commit('resetState')
      return '/login'
    }
  }
  return true
})
router.afterEach(to => {
  document.title = `${String(to.meta.title || '管理后台')} - 流沙社区`
  if (to.name && to.meta.title) store.commit('addTab', { name: String(to.name), title: String(to.meta.title) })
})
export default router
