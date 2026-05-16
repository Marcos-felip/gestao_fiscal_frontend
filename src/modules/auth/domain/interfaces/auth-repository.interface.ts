import { Either } from '@/core/either/either'
import { AuthUser } from '../entities/auth.entity'
import { AuthToken } from '../models/auth-token.model'
import { LoginDto, RegisterDto, RefreshTokenDto } from '../dto/auth-dto'

export interface IAuthRepository {
  login(dto: LoginDto): Promise<Either<Error, { token: AuthToken; user: AuthUser }>>
  register(dto: RegisterDto): Promise<Either<Error, { token: AuthToken; user: AuthUser }>>
  refreshToken(dto: RefreshTokenDto): Promise<Either<Error, { token: AuthToken; user: AuthUser }>>
  logout(): Promise<Either<Error, void>>
}