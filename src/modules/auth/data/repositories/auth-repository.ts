import type { IAuthRepository } from '@/modules/auth/domain/interfaces/i-auth-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { AuthResponse } from '@/modules/auth/domain/responses/auth-response'
import type { LoginDto } from '@/modules/auth/domain/dto/login-dto'
import type { RegisterDto } from '@/modules/auth/domain/dto/register-dto'
import type { RefreshTokenDto } from '@/modules/auth/domain/dto/refresh-token-dto'
import { httpClient } from '@/core/client/http-client'
import { toAuthResponse } from '@/modules/auth/data/mappers/auth.mapper'

export class AuthRepository implements IAuthRepository {
  async login(dto: LoginDto): Promise<Either<DomainError, AuthResponse>> {
    const result = await httpClient.post<unknown>('/auth/login', {
      email: dto.email,
      password: dto.password,
    })
    return result.flatMap(toAuthResponse)
  }

  async register(dto: RegisterDto): Promise<Either<DomainError, AuthResponse>> {
    const result = await httpClient.post<unknown>('/auth/register', {
      name: dto.name,
      email: dto.email,
      password: dto.password,
    })
    return result.flatMap(toAuthResponse)
  }

  async refreshToken(
    dto: RefreshTokenDto,
  ): Promise<Either<DomainError, AuthResponse>> {
    const result = await httpClient.post<unknown>('/auth/refresh', {
      refreshToken: dto.refreshToken,
    })
    return result.flatMap(toAuthResponse)
  }

  async logout(): Promise<Either<DomainError, void>> {
    return httpClient.post<void>('/auth/logout')
  }
}
