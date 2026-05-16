import { Either } from '@/core/either/either'
import { AuthUser } from '../entities/auth.entity'
import { AuthToken } from '../models/auth-token.model'

export interface IAuthRepository {
  login(email: string, password: string): Promise<Either<Error, { token: AuthToken; user: AuthUser }>>
  register(name: string, email: string, password: string): Promise<Either<Error, { token: AuthToken; user: AuthUser }>>
  refreshToken(refreshToken: string): Promise<Either<Error, { token: AuthToken; user: AuthUser }>>
  logout(): Promise<Either<Error, void>>
}