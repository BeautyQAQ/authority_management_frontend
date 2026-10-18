/// <reference types="vite/client" />
import type { Store } from 'vuex'
import type { RootState } from './store'
import type { AxiosInstance } from 'axios'
declare module 'vue' {
  interface ComponentCustomProperties {
    $store: Store<RootState>
    $axios: AxiosInstance
    hasAuth: (permission: string) => boolean
  }
}
export {}
