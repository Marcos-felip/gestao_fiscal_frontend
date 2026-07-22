import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { AuthResult } from '../responses/auth-result-response'
import type { LoginDto } from '../dto/login-dto'
import type { RegisterDto } from '../dto/register-dto'
import type { RefreshTokenDto } from '../dto/refresh-token-dto'

export interface IAuthRepository {
  login(dto: LoginDto): Promise<Either<DomainError, AuthResult>>
  register(dto: RegisterDto): Promise<Either<DomainError, AuthResult>>
  refreshToken(dto: RefreshTokenDto): Promise<Either<DomainError, AuthResult>>
  logout(): Promise<Either<DomainError, void>>
}
