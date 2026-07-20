import { Either } from '@/core/either/either'
import type { AuthResult } from '../types/auth.types'
import { LoginDto, RegisterDto, RefreshTokenDto } from '../dto/auth-dto'

export interface IAuthRepository {
  login(dto: LoginDto): Promise<Either<Error, AuthResult>>
  register(dto: RegisterDto): Promise<Either<Error, AuthResult>>
  refreshToken(dto: RefreshTokenDto): Promise<Either<Error, AuthResult>>
  logout(): Promise<Either<Error, void>>
}
