import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { setupInterceptors } from '@/core/client/interceptors'
import { toDomainError } from '@/core/client/http-error-mapper'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

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
      HttpClient.instance = new HttpClient(API_BASE_URL)
    }
    return HttpClient.instance
  }

  /**
   * Converte a promessa do Axios em `Either`, traduzindo qualquer falha para um
   * `DomainError`. Nenhuma exceção escapa daqui.
   */
  private async request<T>(
    send: () => Promise<{ data: T }>,
  ): Promise<Either<DomainError, T>> {
    try {
      const response = await send()
      return Either.right(response.data)
    } catch (error) {
      return Either.left(toDomainError(error))
    }
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<Either<DomainError, T>> {
    return this.request<T>(() => this.axiosInstance.get<T>(url, config))
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<Either<DomainError, T>> {
    return this.request<T>(() => this.axiosInstance.post<T>(url, data, config))
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<Either<DomainError, T>> {
    return this.request<T>(() => this.axiosInstance.patch<T>(url, data, config))
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<Either<DomainError, T>> {
    return this.request<T>(() => this.axiosInstance.put<T>(url, data, config))
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<Either<DomainError, T>> {
    return this.request<T>(() => this.axiosInstance.delete<T>(url, config))
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

export const httpClient = HttpClient.getInstance()
