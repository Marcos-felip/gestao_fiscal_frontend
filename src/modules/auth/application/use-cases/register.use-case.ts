import type { IAuthRepository } from '@/modules/auth/domain/interfaces/i-auth-repository.interface'
import { Either } from '@/core/either/either'
import type { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import type { AuthToken } from '@/modules/auth/domain/models/auth-token.model'
import type { RegisterDto } from '@/modules/auth/domain/dto/auth-dto'

export class RegisterUseCase {
  private readonly authRepository: IAuthRepository

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository
  }

  async execute(
    dto: RegisterDto,
  ): Promise<Either<Error, { token: AuthToken; user: AuthUser }>> {
    return this.authRepository.register(dto)
  }
}
