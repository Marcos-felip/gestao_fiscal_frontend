import type { IAuthRepository } from '@/modules/auth/domain/interfaces/i-auth-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { AuthResponse } from '@/modules/auth/domain/responses/auth-response'
import type { LoginDto } from '@/modules/auth/domain/dto/login-dto'

export class LoginUseCase {
  private readonly authRepository: IAuthRepository

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository
  }

  async execute(dto: LoginDto): Promise<Either<DomainError, AuthResponse>> {
    return this.authRepository.login(dto)
  }
}
