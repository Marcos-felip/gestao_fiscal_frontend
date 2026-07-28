import type { IAuthRepository } from '@/modules/auth/domain/interfaces/i-auth-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { ChangePasswordDto } from '@/modules/auth/domain/dto/change-password-dto'
import type { ChangePasswordResult } from '@/modules/auth/domain/responses/change-password-response'

export class ChangePasswordFirstLoginUseCase {
  private readonly authRepository: IAuthRepository

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository
  }

  async execute(
    dto: ChangePasswordDto,
  ): Promise<Either<DomainError, ChangePasswordResult>> {
    return this.authRepository.changePasswordFirstLogin(dto)
  }
}
