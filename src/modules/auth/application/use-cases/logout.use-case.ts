import type { IAuthRepository } from '@/modules/auth/domain/interfaces/i-auth-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'

export class LogoutUseCase {
  private readonly authRepository: IAuthRepository

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository
  }

  async execute(): Promise<Either<DomainError, void>> {
    return this.authRepository.logout()
  }
}
