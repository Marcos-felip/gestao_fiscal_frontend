import type { IAuthRepository } from '@/modules/auth/domain/interfaces/auth-repository.interface'
import { Either } from '@/core/either/either'
import type { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import type { AuthToken } from '@/modules/auth/domain/models/auth-token.model'

export class RefreshTokenUseCase {
  private readonly authRepository: IAuthRepository

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository
  }

  async execute(refreshToken: string): Promise<Either<Error, { token: AuthToken; user: AuthUser }>> {
    return this.authRepository.refreshToken(refreshToken)
  }
}