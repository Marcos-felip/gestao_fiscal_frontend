import type { IAuthRepository } from '@/modules/auth/domain/interfaces/auth-repository.interface'
import { Either } from '@/core/either/either'
import { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import { AuthToken } from '@/modules/auth/domain/models/auth-token.model'
import { httpClient } from '@/core/client/http-client'

export class AuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<Either<Error, { token: AuthToken; user: AuthUser }>> {
    const result = await httpClient.post<Record<string, unknown>>('/auth/login', { email, password })
    return result.map((data) => ({
      token: AuthToken.fromJson(data),
      user: AuthUser.fromJson(data),
    }))
  }

  async register(name: string, email: string, password: string): Promise<Either<Error, { token: AuthToken; user: AuthUser }>> {
    const result = await httpClient.post<Record<string, unknown>>('/auth/register', { name, email, password })
    return result.map((data) => ({
      token: AuthToken.fromJson(data),
      user: AuthUser.fromJson(data),
    }))
  }

  async refreshToken(refreshToken: string): Promise<Either<Error, { token: AuthToken; user: AuthUser }>> {
    const result = await httpClient.post<Record<string, unknown>>('/auth/refresh', { refreshToken })
    return result.map((data) => ({
      token: AuthToken.fromJson(data),
      user: AuthUser.fromJson(data),
    }))
  }

  async logout(): Promise<Either<Error, void>> {
    return httpClient.post<void>('/auth/logout')
  }
}