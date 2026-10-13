import axios from 'axios'
import { ElMessage } from 'element-plus'
const request = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api', timeout: 10000 })
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = token
  return config
})
request.interceptors.response.use(response => {
  if (response.data.code === 200) return response
  const message = response.data.msg || '系统异常'
  ElMessage.error(message)
  return Promise.reject(new Error(message))
}, error => {
  if (error.response?.status === 401) localStorage.removeItem('token')
  ElMessage.error(error.response?.data?.msg || error.message || '网络连接失败')
  return Promise.reject(error)
})
export default request
