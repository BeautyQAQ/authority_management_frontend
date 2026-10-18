import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import request from './axios'
import { hasAuth } from './globalFun'

const app = createApp(App)
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK === 'true') await import('./mock')
app.config.globalProperties.$axios = request
app.config.globalProperties.hasAuth = hasAuth
app.use(store).use(router).mount('#app')
