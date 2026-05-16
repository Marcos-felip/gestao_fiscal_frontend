import type { IAuthRepository } from '@/modules/auth/domain/interfaces/auth-repository.interface'
import { Either } from '@/core/either/either'
import type { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import type { AuthToken } from '@/modules/auth/domain/models/auth-token.model'

export class LoginUseCase {
  private readonly authRepository: IAuthRepository

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository
  }

  async execute(email: string, password: string): Promise<Either<Error, { token: AuthToken; user: AuthUser }>> {
    return this.authRepository.login(email, password)
  }
}