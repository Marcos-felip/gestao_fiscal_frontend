import type { IAuthRepository } from '@/modules/auth/domain/interfaces/i-auth-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { AuthResponse } from '@/modules/auth/domain/responses/auth-response'
import type { RegisterDto } from '@/modules/auth/domain/dto/register-dto'

export class RegisterUseCase {
  private readonly authRepository: IAuthRepository

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository
  }

  async execute(dto: RegisterDto): Promise<Either<DomainError, AuthResponse>> {
    return this.authRepository.register(dto)
  }
}
