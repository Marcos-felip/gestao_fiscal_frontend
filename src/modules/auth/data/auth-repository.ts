import type { IAuthRepository } from '@/modules/auth/domain/interfaces/i-auth-repository.interface'
import { Either } from '@/core/either/either'
import { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import { AuthToken } from '@/modules/auth/domain/models/auth-token.model'
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
} from '@/modules/auth/domain/dto/auth-dto'
import { httpClient } from '@/core/client/http-client'

export class AuthRepository implements IAuthRepository {
  async login(
    dto: LoginDto,
  ): Promise<Either<Error, { token: AuthToken; user: AuthUser }>> {
    const result = await httpClient.post<AuthResponseDto>(
      '/auth/login',
      { email: dto.email, password: dto.password },
    )
    return result.map((data) => ({
      token: AuthToken.fromJson(data),
      user: AuthUser.fromJson(data.user),
    }))
  }

  async register(
    dto: RegisterDto,
  ): Promise<Either<Error, { token: AuthToken; user: AuthUser }>> {
    const result = await httpClient.post<AuthResponseDto>(
      '/auth/register',
      { name: dto.name, email: dto.email, password: dto.password },
    )
    return result.map((data) => ({
      token: AuthToken.fromJson(data),
      user: AuthUser.fromJson(data.user),
    }))
  }

  async refreshToken(
    dto: RefreshTokenDto,
  ): Promise<Either<Error, { token: AuthToken; user: AuthUser }>> {
    const result = await httpClient.post<AuthResponseDto>(
      '/auth/refresh',
      { refreshToken: dto.refreshToken },
    )
    return result.map((data) => ({
      token: AuthToken.fromJson(data),
      user: AuthUser.fromJson(data.user),
    }))
  }

  async logout(): Promise<Either<Error, void>> {
    return httpClient.post<void>('/auth/logout')
  }
}
