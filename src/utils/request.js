/**
 * Axios request module
 * 
 * Base URL variable for easy switching between environments.
 * Change API_BASE_URL when deploying to production.
 */

import axios from 'axios'

// ======== Configuration ========
// Development server: http://localhost:8082
// Production: change to your server URL (e.g. '/api' or 'https://your-domain.com/api')

const API_BASE_URL = 'http://localhost:8082'

const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
})

// ======== Request Interceptor ========
service.interceptors.request.use(
  config => {
    // Attach auth token for authenticated requests
    const token = localStorage.getItem('relic_admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method.toUpperCase()} ${config.url}`, config.params || '')
    }

    return config
  },
  error => {
    console.error('[Request Error]', error)
    return Promise.reject(error)
  }
)

// ======== Response Interceptor ========
service.interceptors.response.use(
  response => {
    const res = response.data

    // Business-level success check
    if (res.success === false) {
      console.error('[API Error]', res.message || 'Unknown error')
      return Promise.reject(new Error(res.message || 'Request failed'))
    }

    return res
  },
  error => {
  if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('[登录异常] 未授权，请重新登录')
          break
        case 403:
          console.error('[权限异常] 拒绝访问，您没有该操作权限')
          break
        case 404:
          console.error('[请求异常] 接口地址不存在，资源未找到')
          break
        case 500:
          console.error('[服务器异常] 服务器内部错误')
          break
        default:
          console.error(`[请求错误 ${error.response.status}]`, error.message)
      }
    } else if (error.request) {
      console.error('[网络异常] 请求已发出，但未收到服务器响应，请检查网络或服务器是否正常运行')
    } else {
      console.error('[请求异常]', error.message)
    }

    return Promise.reject(error)
  }
)

export default service
