import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { StorageService } from '@/core/utils/storage'

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token)
    } else {
      promise.reject(error)
    }
  })
  failedQueue = []
}

export function setupInterceptors(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = StorageService.getToken()
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(axiosInstance(originalRequest))
              },
              reject,
            })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        const refreshToken = StorageService.getRefreshToken()

        if (!refreshToken) {
          StorageService.clearAll()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        try {
          const response = await axios.post(
            `${axiosInstance.defaults.baseURL}/auth/refresh`,
            { refreshToken },
          )

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data
          StorageService.setToken(newAccessToken)
          StorageService.setRefreshToken(newRefreshToken)

          processQueue(null, newAccessToken)

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          StorageService.clearAll()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    },
  )
}