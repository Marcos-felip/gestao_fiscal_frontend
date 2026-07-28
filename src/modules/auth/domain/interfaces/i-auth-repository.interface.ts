import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { AuthResponse } from '@/modules/auth/domain/responses/auth-response'
import type { LoginDto } from '@/modules/auth/domain/dto/login-dto'
import type { RegisterDto } from '@/modules/auth/domain/dto/register-dto'
import type { RefreshTokenDto } from '@/modules/auth/domain/dto/refresh-token-dto'
import type { ChangePasswordDto } from '@/modules/auth/domain/dto/change-password-dto'
import type { ChangePasswordResult } from '@/modules/auth/domain/responses/change-password-response'

export interface IAuthRepository {
  login(dto: LoginDto): Promise<Either<DomainError, AuthResponse>>
  register(dto: RegisterDto): Promise<Either<DomainError, AuthResponse>>
  refreshToken(dto: RefreshTokenDto): Promise<Either<DomainError, AuthResponse>>
  logout(): Promise<Either<DomainError, void>>
  changePasswordFirstLogin(
    dto: ChangePasswordDto,
  ): Promise<Either<DomainError, ChangePasswordResult>>
}
