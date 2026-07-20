import type { IAuthRepository } from '@/modules/auth/domain/interfaces/i-auth-repository.interface'
import { Either } from '@/core/either/either'
import type { AuthResult } from '@/modules/auth/domain/types/auth.types'
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
} from '@/modules/auth/domain/dto/auth-dto'
import { httpClient } from '@/core/client/http-client'
import { toAuthResult } from '@/modules/auth/data/mappers/auth.mapper'

export class AuthRepository implements IAuthRepository {
  async login(dto: LoginDto): Promise<Either<Error, AuthResult>> {
    const result = await httpClient.post<unknown>('/auth/login', {
      email: dto.email,
      password: dto.password,
    })
    return result.flatMap(toAuthResult)
  }


  
  async register(dto: RegisterDto): Promise<Either<Error, AuthResult>> {
    const result = await httpClient.post<unknown>('/auth/register', {
      name: dto.name,
      email: dto.email,
      password: dto.password,
    })
    return result.flatMap(toAuthResult)
  }

  async refreshToken(dto: RefreshTokenDto): Promise<Either<Error, AuthResult>> {
    const result = await httpClient.post<unknown>('/auth/refresh', {
      refreshToken: dto.refreshToken,
    })
    return result.flatMap(toAuthResult)
  }

  async logout(): Promise<Either<Error, void>> {
    return httpClient.post<void>('/auth/logout')
  }
}
