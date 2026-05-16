import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { Either } from '@/core/either/either'
import { setupInterceptors } from '@/core/client/interceptors'
export class HttpClient {
  private static instance: HttpClient
  private readonly axiosInstance: AxiosInstance

  private constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    })
    setupInterceptors(this.axiosInstance)
  }

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1')
    }
    return HttpClient.instance
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<Either<Error, T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, config)
      return Either.right(response.data)
    } catch (error) {
      return Either.left(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<Either<Error, T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config)
      return Either.right(response.data)
    } catch (error) {
      return Either.left(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<Either<Error, T>> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config)
      return Either.right(response.data)
    } catch (error) {
      return Either.left(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<Either<Error, T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config)
      return Either.right(response.data)
    } catch (error) {
      return Either.left(error instanceof Error ? error : new Error(String(error)))
    }
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

export const httpClient = HttpClient.getInstance()