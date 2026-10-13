import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import request from './axios'
import { hasAuth } from './globalFun'

const app = createApp(App)
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK === 'true') await import('./mock')
app.config.globalProperties.$axios = request
app.config.globalProperties.hasAuth = hasAuth
app.use(store).use(router).use(ElementPlus, { locale: zhCn }).mount('#app')
